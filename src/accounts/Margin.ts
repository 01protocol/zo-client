import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { Market as SerumMarket } from "@project-serum/serum";
import BN from "bn.js";
import { Buffer } from "buffer";
import BaseAccount from "./BaseAccount";
import State from "./State";
import Control from "./Control";
import Num from "../Num";
import { loadWI80F48 } from "../utils";
import { MarginSchema, OrderType, TransactionId, Zo } from "../types";
import {
  CONTROL_ACCOUNT_SIZE,
  SERUM_SPOT_PROGRAM_ID,
  SERUM_SWAP_PROGRAM_ID,
  ZO_DEX_PROGRAM_ID,
} from "../config";
import Decimal from "decimal.js";
import Cache from "./Cache";

interface Schema extends Omit<MarginSchema, "collateral"> {
  /** The deposit amount divided by the entry supply or borrow multiplier */
  rawCollateral: Decimal[];
  /** The collateral value after applying supply/ borrow APY (i.e. the raw collateral multiplied by the current supply or borrow multiplier). */
  actualCollateral: Num[];
}

/**
 * The margin account is a PDA generated using
 * ```javascript
 * seeds=[userWalletKey, stateKey, "marginv1"]
 * ```.
 */
export default class Margin extends BaseAccount<Schema> {
  private constructor(
    program: Program<Zo>,
    pubkey: PublicKey,
    data: Schema,
    public readonly control: Control,
    public readonly state: State,
  ) {
    super(program, pubkey, data);
  }

  /**
   * Loads a new Margin object.
   */
  static async load(
    program: Program<Zo>,
    st: State,
    ch: Cache,
  ): Promise<Margin> {
    const [key, _nonce] = await this.getPda(
      st,
      program.provider.wallet.publicKey,
      program.programId,
    );
    const data = await this.fetch(program, key, st, ch);
    const control = await Control.load(program, data.control);
    return new this(program, key, data, control, st);
  }

  static async create(program: Program<Zo>, st: State): Promise<Margin> {
    const conn = program.provider.connection;
    const [[key, nonce], control, controlLamports] = await Promise.all([
      this.getPda(st, program.provider.wallet.publicKey, program.programId),
      Keypair.generate(),
      conn.getMinimumBalanceForRentExemption(CONTROL_ACCOUNT_SIZE),
    ]);
    await conn.confirmTransaction(
      await program.rpc.createMargin(nonce, {
        accounts: {
          state: st.pubkey,
          authority: program.provider.wallet.publicKey,
          margin: key,
          control: control.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
        preInstructions: [
          SystemProgram.createAccount({
            fromPubkey: program.provider.wallet.publicKey,
            newAccountPubkey: control.publicKey,
            lamports: controlLamports,
            space: CONTROL_ACCOUNT_SIZE,
            programId: program.programId,
          }),
        ],
        signers: [control],
      }),
    );
    return await Margin.load(program, st, st.cache);
  }

  /**
   * Gets the Margin account's PDA and bump.
   * @returns An array consisting of [PDA, bump]
   */
  static async getPda(
    st: State,
    traderKey: PublicKey,
    programId: PublicKey,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [traderKey.toBuffer(), st.pubkey.toBuffer(), Buffer.from("marginv1")],
      programId,
    );
  }

  private static async fetch(
    program: Program<Zo>,
    k: PublicKey,
    st: State,
    ch: Cache,
  ): Promise<Schema> {
    const data = (await program.account["margin"].fetch(k)) as MarginSchema;
    const rawCollateral = data.collateral
      .map((c) => loadWI80F48(c!))
      .slice(0, st.data.totalCollaterals);
    return {
      ...data,
      rawCollateral,
      actualCollateral: st.data.collaterals.map(
        (c, i) =>
          new Num(
            new BN(
              rawCollateral[i]!.isPos()
                ? rawCollateral[i]!.times(
                    ch.data.borrowCache[i]!.supplyMultiplier,
                  )
                    .floor()
                    .toString()
                : rawCollateral[i]!.times(
                    ch.data.borrowCache[i]!.borrowMultiplier,
                  )
                    .floor()
                    .toString(),
            ),
            c.decimals,
          ),
      ),
    };
  }

  async refresh(): Promise<void> {
    [this.data] = await Promise.all([
      Margin.fetch(this.program, this.pubkey, this.state, this.state.cache),
      this.control.refresh(),
      this.state.refresh(),
    ]);
  }

  /**
   * @param symbol The market symbol. Ex: ("BTC-PERP")
   * @returns The OpenOrders account key for the given market.
   */
  async getOpenOrdersKeyBySymbol(symbol: string): Promise<[PublicKey, number]> {
    const dexMarket = this.state.getMarketKeyBySymbol(symbol);
    return await PublicKey.findProgramAddress(
      [this.data.control.toBuffer(), dexMarket.toBuffer()],
      ZO_DEX_PROGRAM_ID,
    );
  }

  /**
   * @param symbol The market symbol. Ex: ("BTC-PERP")
   * @param create If true, creates the OpenOrders account if it doesn't exist.
   * @returns The OpenOrdersInfo for the given market.
   */
  async getOpenOrdersInfoBySymbol(
    symbol: string,
    create = false,
  ): Promise<Control["data"]["openOrdersAgg"][0] | null> {
    const marketIndex = this.state.getMarketIndexBySymbol(symbol);
    let oo = this.control.data.openOrdersAgg[marketIndex];
    if (oo!.key.equals(PublicKey.default)) {
      if (create) {
        await this.createPerpOpenOrders(symbol);
        oo = this.control.data.openOrdersAgg[marketIndex];
      } else {
        return null;
      }
    }
    return oo!;
  }

  /**
   * Deposits a given amount of collateral into the Margin account.
   * @param tokenAccount The user's token account where tokens will be subtracted from.
   * @param vault The state vault where tokens will be deposited into.
   * @param amount The amount of tokens to deposit, in native quantity. (ex: lamports for SOL, satoshis for BTC)
   * @param repayOnly If true, will only deposit up to the amount borrowed. If true, amount parameter can be set to an arbitrarily large number to ensure that any outstanding borrow is fully repaid.
   */
  async deposit(
    tokenAccount: PublicKey,
    vault: PublicKey,
    amount: BN,
    repayOnly: boolean,
  ) {
    return await this.program.rpc.deposit(repayOnly, amount, {
      accounts: {
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        cache: this.state.cache.pubkey,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        tokenAccount,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
  }

  /**
   * Withdraws a given amount of collateral from the Margin account. If withdrawing more than the amount deposited, then account will be borrowing.
   * @param tokenAccount The user's token account where tokens will be withdrawn to.
   * @param vault The state vault where tokens will be withdrawn from.
   * @param amount The amount of tokens to withdraw, in native quantity. (ex: lamports for SOL, satoshis for BTC)
   * @param allowBorrow If false, will only be able to withdraw up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully withdrawn.
   */
  async withdraw(
    tokenAccount: PublicKey,
    vault: PublicKey,
    amount: BN,
    allowBorrow: boolean,
  ) {
    return await this.program.rpc.withdraw(allowBorrow, amount, {
      accounts: {
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        cache: this.state.cache.pubkey,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        control: this.data.control,
        tokenAccount,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
  }

  /**
   * User must create a perp OpenOrders account for every perpetual market(future and or options) they intend to trade on.
   * @param symbol The market symbol. Ex: ("BTC-PERP")
   */
  async createPerpOpenOrders(symbol: string): Promise<string> {
    const [ooKey, _] = await this.getOpenOrdersKeyBySymbol(symbol);
    return await this.program.rpc.createPerpOpenOrders({
      accounts: {
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        control: this.data.control,
        openOrders: ooKey,
        dexMarket: this.state.getMarketKeyBySymbol(symbol),
        dexProgram: ZO_DEX_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
    });
  }

  /**
   * Places an order on the orderbook for a given market, using lot sizes for limit and base quantity, and native units for quote quantity.
   * Assumes an open orders account has been created already.
   * @param symbol The market symbol. Ex: ("BTC-PERP")
   * @param orderType The order type. Either limit, immediateOrCancel, or postOnly.
   * @param isLong True if buy, false if sell.
   * @param limitPrice The limit price in base lots per quote lots.
   * @param maxBaseQty The maximum amount of base lots to buy or sell.
   * @param maxQuoteQty The maximum amount of native quote, including fees, to pay or receive.
   */
  async placePerpOrderRaw({
    symbol,
    orderType,
    isLong,
    limitPrice,
    maxBaseQty,
    maxQuoteQty,
  }: Readonly<{
    symbol: string;
    orderType: OrderType;
    isLong: boolean;
    limitPrice: BN;
    maxBaseQty: BN;
    maxQuoteQty: BN;
  }>): Promise<TransactionId> {
    const market = await this.state.getMarketBySymbol(symbol);
    const oo = await this.getOpenOrdersInfoBySymbol(symbol);

    return await this.program.rpc.placePerpOrder(
      isLong,
      limitPrice,
      maxBaseQty,
      maxQuoteQty,
      orderType,
      {
        accounts: {
          state: this.state.pubkey,
          stateSigner: this.state.signer,
          cache: this.state.cache.pubkey,
          authority: this.wallet.publicKey,
          margin: this.pubkey,
          control: this.control.pubkey,
          openOrders: oo!.key,
          dexMarket: market.address,
          reqQ: market.requestQueueAddress,
          eventQ: market.eventQueueAddress,
          marketBids: market.bidsAddress,
          marketAsks: market.asksAddress,
          dexProgram: ZO_DEX_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
      },
    );
  }

  /**
   * Places a perp order on the orderbook. Creates an Open orders account if does not exist, in the same transaction.
   * @param symbol The market symbol. Ex: ("BTC-PERP")
   * @param orderType The order type. Either limit, immediateOrCancel, or postOnly.
   * @param isLong True if buy, false if sell.
   * @param limitPrice The limit price in big quote units per big base units. Ex: (50_000 USD/SOL)
   * @param maxBaseQty The maximum amount of big base units to buy or sell.
   * @param maxQuoteQty The maximum amount of big quote units, including fees, to pay or receive.
   */
  async placePerpOrder({
    symbol,
    orderType,
    isLong,
    limitPrice,
    maxBaseQty,
    maxQuoteQty,
  }: Readonly<{
    symbol: string;
    orderType: OrderType;
    isLong: boolean;
    limitPrice: number;
    maxBaseQty: number;
    maxQuoteQty: number;
  }>): Promise<TransactionId> {
    const market = await this.state.getMarketBySymbol(symbol);
    const limitPriceBn = market.priceNumberToLots(limitPrice);
    const maxBaseQtyBn = market.baseSizeNumberToLots(maxBaseQty);
    const maxQuoteQtyBn = market.quoteSizeNumberToSmoll(maxQuoteQty);

    let ooKey;
    let oo = await this.getOpenOrdersInfoBySymbol(symbol);
    let createOo;
    if (!oo) {
      ooKey = (await this.getOpenOrdersKeyBySymbol(symbol))[0];
      createOo = true;
    } else {
      ooKey = oo.key;
      createOo = false;
    }

    return await this.program.rpc.placePerpOrder(
      isLong,
      limitPriceBn,
      maxBaseQtyBn,
      maxQuoteQtyBn,
      orderType,
      {
        accounts: {
          state: this.state.pubkey,
          stateSigner: this.state.signer,
          cache: this.state.cache.pubkey,
          authority: this.wallet.publicKey,
          margin: this.pubkey,
          control: this.control.pubkey,
          openOrders: ooKey,
          dexMarket: market.address,
          reqQ: market.requestQueueAddress,
          eventQ: market.eventQueueAddress,
          marketBids: market.bidsAddress,
          marketAsks: market.asksAddress,
          dexProgram: ZO_DEX_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
        preInstructions: createOo
          ? [
              this.program.instruction.createPerpOpenOrders({
                accounts: {
                  state: this.state.pubkey,
                  stateSigner: this.state.signer,
                  authority: this.wallet.publicKey,
                  margin: this.pubkey,
                  control: this.data.control,
                  openOrders: ooKey,
                  dexMarket: this.state.getMarketKeyBySymbol(symbol),
                  dexProgram: ZO_DEX_PROGRAM_ID,
                  rent: SYSVAR_RENT_PUBKEY,
                  systemProgram: SystemProgram.programId,
                },
              }),
            ]
          : undefined,
      },
    );
  }

  /**
   * Cancels an order on the orderbook for a given market.
   * @param symbol The market symbol. Ex: ("BTC-PERP")
   * @param isLong True if the order being cancelled is a buy order, false if sell order.
   * @param orderId The order id of the order to cancel. To get order id, call loadOrdersForOwner through the market.
   */
  async cancelPerpOrder(symbol: string, isLong: boolean, orderId: BN) {
    const market = await this.state.getMarketBySymbol(symbol);
    const oo = await this.getOpenOrdersInfoBySymbol(symbol);

    return await this.program.rpc.cancelPerpOrder(orderId, isLong, {
      accounts: {
        state: this.state.pubkey,
        cache: this.state.cache.pubkey,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        control: this.control.pubkey,
        openOrders: oo!.key,
        dexMarket: market.address,
        marketBids: market.bidsAddress,
        marketAsks: market.asksAddress,
        eventQ: market.eventQueueAddress,
        dexProgram: ZO_DEX_PROGRAM_ID,
      },
    });
  }

  /**
   * Swaps between USDC and a given Token B (or vice versa) on the Serum Spot DEX. This is a direct IOC trade that instantly settles.
   * Note that the token B needs to be swappable, as enabled by the program.
   * @param buy If true, the swapping USDC for Token B. If false, the swapping Token B for USDC.
   * @param tokenMint The mint public key of Token B.
   * @param amount The native amount of tokens to swap *from*. If buy, this is USDC. If not buy, this is Token B.
   * @param minRate The exchange rate to use when determining whether the transaction should abort.
   * @param allowBorrow If false, will only be able to swap up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully swapped.
   * @param serumMarket The market public key of the Serum Spot DEX.
   */
  async swap({
    buy,
    tokenMint,
    amount,
    minRate,
    allowBorrow,
    serumMarket,
  }: Readonly<{
    buy: boolean;
    tokenMint: PublicKey;
    amount: BN;
    minRate: BN;
    allowBorrow: boolean;
    serumMarket: PublicKey;
  }>): Promise<TransactionId> {
    if (this.state.data.totalCollaterals < 1) {
      throw new Error(
        `<State ${this.state.pubkey.toString()}> does not have a base collateral`,
      );
    }

    const market = await SerumMarket.load(
      this.connection,
      serumMarket,
      {},
      SERUM_SPOT_PROGRAM_ID,
    );

    const colIdx = this.state.getCollateralIndex(tokenMint);
    const stateQuoteMint = this.state.data.collaterals[0]!.mint;

    if (
      !market.baseMintAddress.equals(tokenMint) ||
      !market.quoteMintAddress.equals(stateQuoteMint)
    ) {
      throw new Error(
        `Invalid <SerumSpotMarket ${serumMarket}> for swap:\n` +
          `  swap wants:   base=${tokenMint}, quote=${stateQuoteMint}\n` +
          `  market wants: base=${market.baseMintAddress}, quote=${market.quoteMintAddress}`,
      );
    }

    return await this.program.rpc.swap(buy, allowBorrow, amount, minRate, {
      accounts: {
        authority: this.wallet.publicKey,
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        cache: this.state.data.cache,
        margin: this.pubkey,
        control: this.data.control,
        quoteMint: stateQuoteMint,
        quoteVault: this.state.data.vaults[0]!,
        assetMint: tokenMint,
        assetVault: this.state.getVaultCollateralByMint(tokenMint)[0],
        swapFeeVault: this.state.data.swapFeeVault,
        serumOpenOrders: this.state.data.collaterals[colIdx]!.serumOpenOrders,
        serumMarket,
        serumRequestQueue: market.decoded.requestQueue,
        serumEventQueue: market.decoded.eventQueue,
        serumBids: market.bidsAddress,
        serumAsks: market.asksAddress,
        serumCoinVault: market.decoded.baseVault,
        serumPcVault: market.decoded.quoteVault,
        serumVaultSigner: market.decoded.vaultSignerNonce,
        srmSpotProgram: SERUM_SPOT_PROGRAM_ID,
        srmSwapProgram: SERUM_SWAP_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    });
  }

  /**
   * Settles unrealized funding and realized PnL into the margin account for a given market.
   * @param symbol
   */
  async settleFunds(symbol: string) {
    const market = await this.state.getMarketBySymbol(symbol);
    const oo = await this.getOpenOrdersInfoBySymbol(symbol);

    return await this.program.rpc.settleFunds({
      accounts: {
        authority: this.wallet.publicKey,
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        cache: this.state.data.cache,
        margin: this.pubkey,
        control: this.data.control,
        openOrders: oo!.key,
        dexMarket: market.address,
        dexProgram: ZO_DEX_PROGRAM_ID,
      },
    });
  }
}
