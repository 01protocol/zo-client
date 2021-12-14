import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { Market as SerumMarket } from "@project-serum/serum";
import BN from "bn.js";
import { Buffer } from "buffer";
import BaseAccount from "./BaseAccount";
import State from "./State";
import Control from "./Control";
import Num from "../Num";
import { loadWrappedI80F48 } from "../utils";
import { MarginSchema, OrderType } from "../types";
import {
  DEX_PROGRAM_ID,
  CONTROL_ACCOUNT_SIZE,
  SERUM_SPOT_PROGRAM_ID,
  SERUM_SWAP_PROGRAM_ID,
} from "../config";

interface Schema extends Omit<MarginSchema, "collateral"> {
  collateral: Num[];
}

export default class Margin extends BaseAccount<Schema> {
  private constructor(
    pubkey: PublicKey,
    data: Schema,
    public readonly control: Control,
    public readonly state: State,
  ) {
    super(pubkey, data);
  }

  private static async fetch(k: PublicKey, st: State): Promise<Schema> {
    const data = (await this.program.account["margin"].fetch(
      k,
    )) as MarginSchema;
    return {
      ...data,
      collateral: st.data.collaterals.map(
        (c, i) =>
          new Num(loadWrappedI80F48(data.collateral[i]!), c.decimals, c.mint),
      ),
    };
  }

  static async load(st: State): Promise<Margin> {
    const [key, _nonce] = await this.getPda(st, this.wallet.publicKey);
    let data = await this.fetch(key, st);
    let control = await Control.load(data.control);
    return new this(key, data, control, st);
  }

  static async create(st: State): Promise<Margin> {
    const [[key, nonce], control, controlLamports] = await Promise.all([
      this.getPda(st, this.wallet.publicKey),
      Keypair.generate(),
      this.connection.getMinimumBalanceForRentExemption(CONTROL_ACCOUNT_SIZE),
    ]);
    this.connection.confirmTransaction(
      await this.program.rpc.createMargin!(nonce, {
        accounts: {
          state: st.pubkey,
          authority: this.wallet.publicKey,
          margin: key,
          control: control.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
        preInstructions: [
          SystemProgram.createAccount({
            fromPubkey: this.wallet.publicKey,
            newAccountPubkey: control.publicKey,
            lamports: controlLamports,
            space: CONTROL_ACCOUNT_SIZE,
            programId: this.program.programId,
          }),
        ],
        signers: [control],
      }),
    );
    return await Margin.load(st);
  }

  static async getPda(
    st: State,
    traderKey: PublicKey,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [traderKey.toBuffer(), st.pubkey.toBuffer(), Buffer.from("marginv1")],
      this.program.programId,
    );
  }

  async refresh(): Promise<void> {
    [this.data] = await Promise.all([
      Margin.fetch(this.pubkey, this.state),
      this.control.refresh(),
      this.state.refresh(),
    ]);
  }

  async getOpenOrdersKey(symbol: string): Promise<[PublicKey, number]> {
    const dexMarket = this.state.getSymbolMarketKey(symbol);
    return await PublicKey.findProgramAddress(
      [this.data.control.toBuffer(), dexMarket.toBuffer()],
      DEX_PROGRAM_ID,
    );
  }

  async getSymbolOpenOrders(
    symbol: string,
    create: boolean = true,
  ): Promise<Control["data"]["openOrdersAgg"][0] | null> {
    const marketIndex = this.state.getSymbolIndex(symbol);
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

  async withdraw(tokenAccount: PublicKey, vault: PublicKey, amount: BN) {
    return await this.program.rpc.withdraw(amount, {
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

  async createPerpOpenOrders(symbol: string) {
    const [ooKey, _] = await this.getOpenOrdersKey(symbol);
    return await this.program.rpc.createPerpOpenOrders({
      accounts: {
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        control: this.data.control,
        openOrders: ooKey,
        dexMarket: this.state.getSymbolMarketKey(symbol),
        dexProgram: DEX_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
    });
  }

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
    limitPrice: BN;
    maxBaseQty: BN;
    maxQuoteQty: BN;
  }>) {
    const market = await this.state.getSymbolMarket(symbol);
    const oo = await this.getSymbolOpenOrders(symbol);

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
          dexProgram: DEX_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
      },
    );
  }

  async cancelPerpOrder(symbol: string, isLong: boolean, orderId: BN) {
    const market = await this.state.getSymbolMarket(symbol);
    const oo = await this.getSymbolOpenOrders(symbol);

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
        dexProgram: DEX_PROGRAM_ID,
      },
    });
  }

  async swap({
    direction,
    tokenMint,
    amount,
    minRate,
    allowBorrow,
    serumMarket,
  }: Readonly<{
    direction: "buy" | "sell";
    tokenMint: PublicKey;
    amount: BN;
    minRate: BN;
    allowBorrow: boolean;
    serumMarket: PublicKey;
  }>) {
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
      market.baseMintAddress !== tokenMint ||
      market.quoteMintAddress !== stateQuoteMint
    ) {
      throw new Error(
        `Invalid <SerumSpotMarket ${serumMarket}> for swap:\n` +
          `  swap wants:   base=${tokenMint}, quote=${stateQuoteMint}\n` +
          `  market wants: base=${market.baseMintAddress}, quote=${market.quoteMintAddress}`,
      );
    }

    return await this.program.rpc.swap(
      direction === "buy",
      allowBorrow,
      amount,
      minRate,
      {
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
          assetVault: this.data.collateral[colIdx]!,
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
      },
    );
  }
}
