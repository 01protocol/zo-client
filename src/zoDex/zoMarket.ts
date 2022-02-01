import { blob, seq, struct } from "buffer-layout";
import {
  accountFlagsLayout,
  i128,
  i64,
  publicKeyLayout,
  u128,
  u64,
} from "./layout";
import { Slab, SLAB_LAYOUT } from "./slab";
import BN from "bn.js";
import {
  AccountInfo,
  AccountMeta,
  Commitment,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { decodeEventQueue, decodeRequestQueue } from "./queue";
import { Buffer } from "buffer";
import { throwIfNull } from "../utils";
import { TransactionId } from "../types";
import {
  WRAPPED_SOL_MINT,
  ZERO_ONE_DEVNET_PROGRAM_ID,
  ZO_DEX_DEVNET_PROGRAM_ID,
  ZO_DEX_MAINNET_PROGRAM_ID,
} from "../config";
import { Program } from "@project-serum/anchor";
import { State } from "../index";

export const MARKET_STATE_LAYOUT_V3 = struct([
  blob(5),

  accountFlagsLayout("accountFlags"),

  publicKeyLayout("ownAddress"),

  u64("quoteFeesAccrued"),

  publicKeyLayout("requestQueue"),
  publicKeyLayout("eventQueue"),

  publicKeyLayout("bids"),
  publicKeyLayout("asks"),

  u64("baseLotSize"),
  u64("quoteLotSize"),

  u64("feeRateBps"),

  u64("referrerRebatesAccrued"),

  i128("fundingIndex"),
  u64("lastUpdated"),
  u64("strike"),
  u64("perpType"),
  u64("coinDecimals"),
  u64("openInterest"),

  publicKeyLayout("authority"),
  publicKeyLayout("pruneAuthority"),

  blob(976),

  blob(7),
]);

export class ZoMarket {
  private readonly _decoded: any;
  private readonly _baseSplTokenDecimals: number;
  private readonly _quoteSplTokenDecimals: number;
  private readonly _skipPreflight: boolean;
  private readonly _commitment: Commitment;
  private readonly _programId: PublicKey;
  private readonly _openOrdersAccountsCache: {
    [publicKey: string]: { accounts: ZoOpenOrders[]; ts: number };
  };
  private _layoutOverride?: any;

  private readonly _feeDiscountKeysCache: {
    [publicKey: string]: {
      accounts: Array<{
        balance: number;
        mint: PublicKey;
        pubkey: PublicKey;
        feeTier: number;
      }>;
      ts: number;
    };
  };

  constructor(
    decoded,
    baseMintDecimals: number,
    quoteMintDecimals: number,
    options: MarketOptions = {},
    programId: PublicKey,
    layoutOverride?: any,
  ) {
    const { skipPreflight = false, commitment = "recent" } = options;
    if (!decoded.accountFlags.initialized || !decoded.accountFlags.market) {
      throw new Error("Invalid market state");
    }
    this._decoded = decoded;
    this._baseSplTokenDecimals = baseMintDecimals;
    this._quoteSplTokenDecimals = quoteMintDecimals;
    this._skipPreflight = skipPreflight;
    this._commitment = commitment;
    this._programId = programId;
    this._openOrdersAccountsCache = {};
    this._feeDiscountKeysCache = {};
    this._layoutOverride = layoutOverride;
  }

  get eventQueueAddress(): PublicKey {
    return this._decoded.eventQueue;
  }

  get requestQueueAddress(): PublicKey {
    return this._decoded.requestQueue;
  }

  get programId(): PublicKey {
    return this._programId;
  }

  get address(): PublicKey {
    return this._decoded.ownAddress;
  }

  get publicKey(): PublicKey {
    return this.address;
  }

  get baseMintAddress(): PublicKey {
    return this._decoded.baseMint;
  }

  get quoteMintAddress(): PublicKey {
    return this._decoded.quoteMint;
  }

  get bidsAddress(): PublicKey {
    return this._decoded.bids;
  }

  get asksAddress(): PublicKey {
    return this._decoded.asks;
  }

  get decoded(): any {
    return this._decoded;
  }

  get minOrderSize() {
    return this.baseSizeLotsToNumber(new BN(1));
  }

  get tickSize() {
    return this.priceLotsToNumber(new BN(1));
  }

  private get _baseSplTokenMultiplier() {
    return new BN(10).pow(new BN(this._baseSplTokenDecimals));
  }

  private get _quoteSplTokenMultiplier() {
    return new BN(10).pow(new BN(this._quoteSplTokenDecimals));
  }

  static getLayout(_programId: PublicKey) {
    return MARKET_STATE_LAYOUT_V3;
  }

  static async findAccountsByMints(
    connection: Connection,
    baseMintAddress: PublicKey,
    quoteMintAddress: PublicKey,
    programId: PublicKey,
  ) {
    const filters = [
      {
        memcmp: {
          offset: this.getLayout(programId).offsetOf("baseMint"),
          bytes: baseMintAddress.toBase58(),
        },
      },
      {
        memcmp: {
          offset: ZoMarket.getLayout(programId).offsetOf("quoteMint"),
          bytes: quoteMintAddress.toBase58(),
        },
      },
    ];
    return getFilteredProgramAccounts(connection, programId, filters);
  }

  static async load(
    connection: Connection,
    address: PublicKey,
    options: MarketOptions = {},
    programId: PublicKey = ZO_DEX_DEVNET_PROGRAM_ID,
    accountInfoPrefetched?: AccountInfo<Buffer>,
    layoutOverride?: any,
  ) {
    const { commitment = "confirmed" } = options;
    const { owner, data } = throwIfNull(
      accountInfoPrefetched
        ? accountInfoPrefetched
        : await connection.getAccountInfo(address, commitment),
      "Market not found",
    );
    if (!owner.equals(programId)) {
      throw new Error("Address not owned by program: " + owner.toBase58());
    }
    const decoded = (layoutOverride ?? this.getLayout(programId)).decode(data);
    if (
      !decoded.accountFlags.initialized ||
      !decoded.accountFlags.market ||
      !decoded.ownAddress.equals(address)
    ) {
      throw new Error("Invalid market");
    }
    return new ZoMarket(
      decoded,
      decoded.coinDecimals,
      6,
      options,
      programId,
      layoutOverride,
    );
  }

  async loadBids(
    connection: Connection,
    commitment?: Commitment,
  ): Promise<Orderbook> {
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.bids, commitment),
    );
    return Orderbook.decode(this, data);
  }

  async loadAsks(
    connection: Connection,
    commitment?: Commitment,
  ): Promise<Orderbook> {
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.asks, commitment),
    );
    return Orderbook.decode(this, data);
  }

  async loadOrdersForOwner(
    connection: Connection,
    controlAddress: PublicKey,
    cacheDurationMs = 0,
  ): Promise<Order[]> {
    const [bids, asks] = await Promise.all([
      this.loadBids(connection),
      this.loadAsks(connection),
    ]);
    return this.filterForOpenOrders(bids, asks, controlAddress);
  }

  filterForOpenOrders(
    bids: Orderbook,
    asks: Orderbook,
    controlAccount: PublicKey,
  ): Order[] {
    return [...bids, ...asks].filter((order) => {
      return order.controlAddress.equals(controlAccount);
    });
  }

  async findBaseTokenAccountsForOwner(
    connection: Connection,
    ownerAddress: PublicKey,
    includeUnwrappedSol = false,
  ): Promise<Array<{ pubkey: PublicKey; account: AccountInfo<Buffer> }>> {
    if (this.baseMintAddress.equals(WRAPPED_SOL_MINT) && includeUnwrappedSol) {
      const [wrapped, unwrapped] = await Promise.all([
        this.findBaseTokenAccountsForOwner(connection, ownerAddress, false),
        connection.getAccountInfo(ownerAddress),
      ]);
      if (unwrapped !== null) {
        return [{ pubkey: ownerAddress, account: unwrapped }, ...wrapped];
      }
      return wrapped;
    }
    return await this.getTokenAccountsByOwnerForMint(
      connection,
      ownerAddress,
      this.baseMintAddress,
    );
  }

  // get supportsSrmFeeDiscounts() {
  //   return supportsSrmFeeDiscounts(this._programId);
  // }
  //
  // async findFeeDiscountKeys(
  //   connection: Connection,
  //   ownerAddress: PublicKey,
  //   cacheDurationMs = 0,
  // ): Promise<
  //   Array<{
  //     pubkey: PublicKey;
  //     feeTier: number;
  //     balance: number;
  //     mint: PublicKey;
  //   }>
  // > {
  //   let sortedAccounts: Array<{
  //     balance: number;
  //     mint: PublicKey;
  //     pubkey: PublicKey;
  //     feeTier: number;
  //   }> = [];
  //   const now = new Date().getTime();
  //   const strOwner = ownerAddress.toBase58();
  //   if (
  //     strOwner in this._feeDiscountKeysCache &&
  //     now - this._feeDiscountKeysCache[strOwner]!.ts < cacheDurationMs
  //   ) {
  //     return this._feeDiscountKeysCache[strOwner]!.accounts;
  //   }
  //
  //   if (this.supportsSrmFeeDiscounts) {
  //     // Fee discounts based on (M)SRM holdings supported in newer versions
  //     const msrmAccounts = (
  //       await this.getTokenAccountsByOwnerForMint(
  //         connection,
  //         ownerAddress,
  //         MSRM_MINT,
  //       )
  //     ).map(({ pubkey, account }) => {
  //       const balance = this.getSplTokenBalanceFromAccountInfo(
  //         account,
  //         MSRM_DECIMALS,
  //       );
  //       return {
  //         pubkey,
  //         mint: MSRM_MINT,
  //         balance,
  //         feeTier: getFeeTier(balance, 0),
  //       };
  //     });
  //     const srmAccounts = (
  //       await this.getTokenAccountsByOwnerForMint(
  //         connection,
  //         ownerAddress,
  //         SRM_MINT,
  //       )
  //     ).map(({ pubkey, account }) => {
  //       const balance = this.getSplTokenBalanceFromAccountInfo(
  //         account,
  //         SRM_DECIMALS,
  //       );
  //       return {
  //         pubkey,
  //         mint: SRM_MINT,
  //         balance,
  //         feeTier: getFeeTier(0, balance),
  //       };
  //     });
  //     sortedAccounts = msrmAccounts.concat(srmAccounts).sort((a, b) => {
  //       if (a.feeTier > b.feeTier) {
  //         return -1;
  //       } else if (a.feeTier < b.feeTier) {
  //         return 1;
  //       } else {
  //         if (a.balance > b.balance) {
  //           return -1;
  //         } else if (a.balance < b.balance) {
  //           return 1;
  //         } else {
  //           return 0;
  //         }
  //       }
  //     });
  //   }
  //   this._feeDiscountKeysCache[strOwner] = {
  //     accounts: sortedAccounts,
  //     ts: now,
  //   };
  //   return sortedAccounts;
  // }
  //
  // async findBestFeeDiscountKey(
  //   connection: Connection,
  //   ownerAddress: PublicKey,
  //   cacheDurationMs = 30000,
  // ): Promise<{ pubkey: PublicKey | null; feeTier: number }> {
  //   const accounts = await this.findFeeDiscountKeys(
  //     connection,
  //     ownerAddress,
  //     cacheDurationMs,
  //   );
  //   if (accounts.length > 0) {
  //     return {
  //       pubkey: accounts[0]!.pubkey,
  //       feeTier: accounts[0]!.feeTier,
  //     };
  //   }
  //   return {
  //     pubkey: null,
  //     feeTier: 0,
  //   };
  // }

  async getTokenAccountsByOwnerForMint(
    connection: Connection,
    ownerAddress: PublicKey,
    mintAddress: PublicKey,
  ): Promise<Array<{ pubkey: PublicKey; account: AccountInfo<Buffer> }>> {
    return (
      await connection.getTokenAccountsByOwner(ownerAddress, {
        mint: mintAddress,
      })
    ).value;
  }

  async findQuoteTokenAccountsForOwner(
    connection: Connection,
    ownerAddress: PublicKey,
    includeUnwrappedSol = false,
  ): Promise<{ pubkey: PublicKey; account: AccountInfo<Buffer> }[]> {
    if (this.quoteMintAddress.equals(WRAPPED_SOL_MINT) && includeUnwrappedSol) {
      const [wrapped, unwrapped] = await Promise.all([
        this.findQuoteTokenAccountsForOwner(connection, ownerAddress, false),
        connection.getAccountInfo(ownerAddress),
      ]);
      if (unwrapped !== null) {
        return [{ pubkey: ownerAddress, account: unwrapped }, ...wrapped];
      }
      return wrapped;
    }
    return await this.getTokenAccountsByOwnerForMint(
      connection,
      ownerAddress,
      this.quoteMintAddress,
    );
  }

  async findOpenOrdersAccountsForOwner(
    connection: Connection,
    ownerAddress: PublicKey,
    cacheDurationMs = 0,
  ): Promise<ZoOpenOrders[]> {
    const strOwner = ownerAddress.toBase58();
    const now = new Date().getTime();
    if (
      strOwner in this._openOrdersAccountsCache &&
      now - this._openOrdersAccountsCache[strOwner]!.ts < cacheDurationMs
    ) {
      return this._openOrdersAccountsCache[strOwner]!.accounts;
    }
    const openOrdersAccountsForOwner = await ZoOpenOrders.findForMarketAndOwner(
      connection,
      this.address,
      ownerAddress,
      this._programId,
    );
    this._openOrdersAccountsCache[strOwner] = {
      accounts: openOrdersAccountsForOwner,
      ts: now,
    };
    return openOrdersAccountsForOwner;
  }

  getSplTokenBalanceFromAccountInfo(
    accountInfo: AccountInfo<Buffer>,
    decimals: number,
  ): number {
    return divideBnToNumber(
      new BN(accountInfo.data.slice(64, 72), 10, "le"),
      new BN(10).pow(new BN(decimals)),
    );
  }

  async loadRequestQueue(connection: Connection) {
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.requestQueue),
    );
    return decodeRequestQueue(data);
  }

  async loadEventQueue(connection: Connection) {
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.eventQueue),
    );
    return decodeEventQueue(data);
  }

  async loadFills(connection: Connection, limit = 100) {
    // TODO: once there's a separate source of fills use that instead
    const { data } = throwIfNull(
      await connection.getAccountInfo(this._decoded.eventQueue),
    );
    const events = decodeEventQueue(data, limit);
    return events
      .filter(
        (event) => event.eventFlags.fill && event.nativeQuantityPaid.gtn(0),
      )
      .map(this.parseFillEvent.bind(this));
  }

  parseFillEvent(event) {
    let size, price, side, priceBeforeFees;
    if (event.eventFlags.bid) {
      side = "buy";
      priceBeforeFees = event.eventFlags.maker
        ? event.nativeQuantityPaid.add(event.nativeFeeOrRebate)
        : event.nativeQuantityPaid.sub(event.nativeFeeOrRebate);
      price = divideBnToNumber(
        priceBeforeFees.mul(this._baseSplTokenMultiplier),
        this._quoteSplTokenMultiplier.mul(event.nativeQuantityReleased),
      );
      size = divideBnToNumber(
        event.nativeQuantityReleased,
        this._baseSplTokenMultiplier,
      );
    } else {
      side = "sell";
      priceBeforeFees = event.eventFlags.maker
        ? event.nativeQuantityReleased.sub(event.nativeFeeOrRebate)
        : event.nativeQuantityReleased.add(event.nativeFeeOrRebate);
      price = divideBnToNumber(
        priceBeforeFees.mul(this._baseSplTokenMultiplier),
        this._quoteSplTokenMultiplier.mul(event.nativeQuantityPaid),
      );
      size = divideBnToNumber(
        event.nativeQuantityPaid,
        this._baseSplTokenMultiplier,
      );
    }
    return {
      ...event,
      side,
      price,
      feeCost:
        this.quoteSplSizeToNumber(event.nativeFeeOrRebate) *
        (event.eventFlags.maker ? -1 : 1),
      size,
    };
  }

  priceLotsToNumber(price: BN) {
    return divideBnToNumber(
      price.mul(this._decoded.quoteLotSize).mul(this._baseSplTokenMultiplier),
      this._decoded.baseLotSize.mul(this._quoteSplTokenMultiplier),
    );
  }

  priceNumberToLots(price: number): BN {
    return new BN(
      Math.round(
        (price *
          Math.pow(10, this._quoteSplTokenDecimals) *
          this._decoded.baseLotSize.toNumber()) /
          (Math.pow(10, this._baseSplTokenDecimals) *
            this._decoded.quoteLotSize.toNumber()),
      ),
    );
  }

  baseSplSizeToNumber(size: BN) {
    return divideBnToNumber(size, this._baseSplTokenMultiplier);
  }

  quoteSplSizeToNumber(size: BN) {
    return divideBnToNumber(size, this._quoteSplTokenMultiplier);
  }

  baseSizeLotsToNumber(size: BN) {
    return divideBnToNumber(
      size.mul(this._decoded.baseLotSize),
      this._baseSplTokenMultiplier,
    );
  }

  baseSizeNumberToLots(size: number): BN {
    const native = new BN(
      Math.round(size * Math.pow(10, this._baseSplTokenDecimals)),
    );
    // rounds down to the nearest lot size
    return native.div(this._decoded.baseLotSize);
  }

  quoteSizeLotsToNumber(size: BN) {
    return divideBnToNumber(
      size.mul(this._decoded.quoteLotSize),
      this._quoteSplTokenMultiplier,
    );
  }

  quoteSizeNumberToLots(size: number): BN {
    const native = new BN(
      Math.round(size * Math.pow(10, this._quoteSplTokenDecimals)),
    );
    // rounds down to the nearest lot size
    return native.div(this._decoded.quoteLotSize);
  }

  quoteSizeNumberToSmoll(size: number): BN {
    const native = new BN(
      Math.round(size * Math.pow(10, this._quoteSplTokenDecimals)),
    );
    // rounds down to the nearest lot size
    return native;
  }

  public async consumeEvents(
    program: Program,
    st: State,
    controlAccs: PublicKey[], // make sure the indexes match
    openOrdersAccs: PublicKey[],
  ): Promise<TransactionId> {
    const limit = 32;

    // const eq = await this.loadEventQueue(program.provider.connection);
    //console.log(eq);

    const signer = (
      await State.getSigner(st.pubkey, ZERO_ONE_DEVNET_PROGRAM_ID)
    )[0];
    return await program.rpc.consumeEvents!(limit, {
      accounts: {
        state: st.pubkey,
        stateSigner: signer,
        dexProgram: program.programId.equals(ZERO_ONE_DEVNET_PROGRAM_ID)
          ? ZO_DEX_DEVNET_PROGRAM_ID
          : ZO_DEX_MAINNET_PROGRAM_ID,
        market: this.address,
        eventQueue: this.eventQueueAddress,
      },
      remainingAccounts: doubleSort(controlAccs, openOrdersAccs),
    });
  }

  // make sure account arrays have same order of user accounts
  public async crankPnl(
    program: Program,
    st: State,
    controlAccs: PublicKey[],
    openOrdersAccs: PublicKey[],
    marginAccs: PublicKey[],
  ): Promise<TransactionId> {
    const ra: AccountMeta[] = [];
    controlAccs.forEach((c, i) => {
      ra.push({ isSigner: false, isWritable: true, pubkey: c });
    });
    openOrdersAccs.forEach((c) => {
      ra.push({ isSigner: false, isWritable: true, pubkey: c });
    });
    marginAccs.forEach((c) => {
      ra.push({ isSigner: false, isWritable: true, pubkey: c });
    });

    const signer = (
      await State.getSigner(st.pubkey, ZERO_ONE_DEVNET_PROGRAM_ID)
    )[0];
    return await program.rpc.crankPnl!({
      accounts: {
        state: st.pubkey,
        stateSigner: signer,
        cache: st.cache.pubkey,
        dexProgram: program.programId.equals(ZERO_ONE_DEVNET_PROGRAM_ID)
          ? ZO_DEX_DEVNET_PROGRAM_ID
          : ZO_DEX_MAINNET_PROGRAM_ID,
        market: this.address,
      },
      remainingAccounts: ra,
    });
  }
}

export interface MarketOptions {
  skipPreflight?: boolean;
  commitment?: Commitment;
}

export const _OPEN_ORDERS_LAYOUT_V2 = struct([
  blob(5),

  accountFlagsLayout("accountFlags"),

  publicKeyLayout("market"),
  publicKeyLayout("owner"),

  // These are in spl-token (i.e. not lot) units
  i64("baseTokenFree"),
  i64("baseTokenTotal"),
  i64("quoteTokenFree"),
  i64("quoteTokenTotal"),

  u128("freeSlotBits"),
  u128("isBidBits"),

  seq(u128(), 128, "orders"),
  seq(u64(), 128, "clientIds"),

  u64("referrerRebatesAccrued"),

  i64("realizedPnl"),
  i128("fundingIndex"),
  u64("coinOnBids"),
  u64("coinOnAsks"),

  blob(7),
]);

export class ZoOpenOrders {
  address: PublicKey;
  market!: PublicKey;
  owner!: PublicKey;
  baseTokenFree!: BN;
  baseTokenTotal!: BN;
  quoteTokenFree!: BN;
  quoteTokenTotal!: BN;
  referrerRebatesAccrued!: BN;
  realizedPnl!: BN;
  fundingIndex!: BN;
  coinOnBids!: BN;
  coinOnAsks!: BN;
  orders!: BN[];
  clientIds!: BN[];
  private _programId: PublicKey;

  constructor(address: PublicKey, decoded, programId: PublicKey) {
    this.address = address;
    this._programId = programId;
    Object.assign(this, decoded);
  }

  get publicKey() {
    return this.address;
  }

  static getLayout(_programId: PublicKey) {
    return _OPEN_ORDERS_LAYOUT_V2;
  }

  static async findForOwner(
    connection: Connection,
    ownerAddress: PublicKey,
    programId: PublicKey,
  ) {
    const filters = [
      {
        memcmp: {
          offset: this.getLayout(programId).offsetOf("owner"),
          bytes: ownerAddress.toBase58(),
        },
      },
      {
        dataSize: this.getLayout(programId).span,
      },
    ];
    const accounts = await getFilteredProgramAccounts(
      connection,
      programId,
      filters,
    );
    return accounts.map(({ publicKey, accountInfo }) =>
      ZoOpenOrders.fromAccountInfo(publicKey, accountInfo, programId),
    );
  }

  static async findForMarketAndOwner(
    connection: Connection,
    marketAddress: PublicKey,
    ownerAddress: PublicKey,
    programId: PublicKey,
  ) {
    const filters = [
      {
        memcmp: {
          offset: this.getLayout(programId).offsetOf("market"),
          bytes: marketAddress.toBase58(),
        },
      },
      {
        memcmp: {
          offset: this.getLayout(programId).offsetOf("owner"),
          bytes: ownerAddress.toBase58(),
        },
      },
      {
        dataSize: this.getLayout(programId).span,
      },
    ];
    const accounts = await getFilteredProgramAccounts(
      connection,
      programId,
      filters,
    );
    return accounts.map(({ publicKey, accountInfo }) =>
      ZoOpenOrders.fromAccountInfo(publicKey, accountInfo, programId),
    );
  }

  static async load(
    connection: Connection,
    address: PublicKey,
    programId: PublicKey,
  ) {
    const accountInfo = await connection.getAccountInfo(address);
    if (accountInfo === null) {
      throw new Error("Open orders account not found");
    }
    return ZoOpenOrders.fromAccountInfo(address, accountInfo, programId);
  }

  static fromAccountInfo(
    address: PublicKey,
    accountInfo: AccountInfo<Buffer>,
    programId: PublicKey,
  ) {
    const { owner, data } = accountInfo;
    if (!owner.equals(programId)) {
      throw new Error("Address not owned by program");
    }
    const decoded = this.getLayout(programId).decode(data);
    if (!decoded.accountFlags.initialized || !decoded.accountFlags.openOrders) {
      throw new Error("Invalid open orders account");
    }
    return new ZoOpenOrders(address, decoded, programId);
  }
}

export const ORDERBOOK_LAYOUT = struct([
  blob(5),
  accountFlagsLayout("accountFlags"),
  SLAB_LAYOUT.replicate("slab"),
  blob(7),
]);

export class Orderbook {
  market: ZoMarket;
  isBids: boolean;
  slab: Slab;

  constructor(market: ZoMarket, accountFlags, slab: Slab) {
    if (!accountFlags.initialized || !(accountFlags.bids ^ accountFlags.asks)) {
      throw new Error("Invalid orderbook");
    }
    this.market = market;
    this.isBids = accountFlags.bids;
    this.slab = slab;
  }

  static get LAYOUT() {
    return ORDERBOOK_LAYOUT;
  }

  static decode(market: ZoMarket, buffer: Buffer) {
    const { accountFlags, slab } = ORDERBOOK_LAYOUT.decode(buffer);
    return new Orderbook(market, accountFlags, slab);
  }

  getL2(depth: number): [number, number, BN, BN][] {
    const descending = this.isBids;
    const levels: [BN, BN][] = []; // (price, size)
    for (const { key, quantity } of this.slab.items(descending)) {
      const price = getPriceFromKey(key);
      if (levels.length > 0 && levels[levels.length - 1]![0].eq(price)) {
        levels[levels.length - 1]![1].iadd(quantity);
      } else if (levels.length === depth) {
        break;
      } else {
        levels.push([price, quantity]);
      }
    }
    return levels.map(([priceLots, sizeLots]) => [
      this.market.priceLotsToNumber(priceLots),
      this.market.baseSizeLotsToNumber(sizeLots),
      priceLots,
      sizeLots,
    ]);
  }

  [Symbol.iterator]() {
    return this.items(false);
  }

  *items(descending = false): Generator<Order> {
    for (const {
      key,
      ownerSlot,
      control,
      quantity,
      feeTier,
      clientOrderId,
    } of this.slab.items(descending)) {
      const price = getPriceFromKey(key);
      yield {
        orderId: key,
        clientId: clientOrderId,
        controlAddress: control,
        openOrdersSlot: ownerSlot,
        feeTier,
        price: this.market.priceLotsToNumber(price),
        priceLots: price,
        size: this.market.baseSizeLotsToNumber(quantity),
        sizeLots: quantity,
        side: (this.isBids ? "buy" : "sell") as "buy" | "sell",
      };
    }
  }
}

export interface Order {
  orderId: BN;
  controlAddress: PublicKey;
  openOrdersSlot: number;
  price: number;
  priceLots: BN;
  size: number;
  feeTier: number;
  sizeLots: BN;
  side: "buy" | "sell";
  clientId?: BN;
}

function getPriceFromKey(key) {
  return key.ushrn(64);
}

function divideBnToNumber(numerator: BN, denominator: BN): number {
  const quotient = numerator.div(denominator).toNumber();
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}

async function getFilteredProgramAccounts(
  connection: Connection,
  programId: PublicKey,
  filters,
): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
  // @ts-ignore
  const resp = await connection._rpcRequest("getProgramAccounts", [
    programId.toBase58(),
    {
      commitment: connection.commitment,
      filters,
      encoding: "base64",
    },
  ]);
  if (resp.error) {
    throw new Error(resp.error.message);
  }
  return resp.result.map(
    ({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: Buffer.from(data[0], "base64"),
        executable,
        owner: new PublicKey(owner),
        lamports,
      },
    }),
  );
}

function doubleSort(a: PublicKey[], b: PublicKey[]): any[] {
  const together: Array<PublicKey[]> = [];
  if (a.length !== b.length) {
    throw new Error("Arrays don't have same length");
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== undefined && b[i] !== undefined) {
      const slice: PublicKey[] = [a[i]!, b[i]!];
      together.push(slice);
    }
  }

  together.sort((a, b) => {
    return a[0]!.toBuffer().swap64().compare(b[0]!.toBuffer().swap64());
  });

  const flattened: any[] = [];

  for (const pair of together) {
    flattened.push({ isSigner: false, isWritable: true, pubkey: pair[0]! });
  }

  for (const pair of together) {
    flattened.push({ isSigner: false, isWritable: true, pubkey: pair[1]! });
  }

  return flattened;
}
