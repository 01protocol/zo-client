import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  Keypair,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import BaseAccount from "./BaseAccount";
import State from "./State";
import Control from "./Control";
import Num from "../Num";
import { loadWrappedI80F48 } from "../utils";
import { MarginSchema, OrderType } from "../types";
import { DEX_PROGRAM_ID, CONTROL_ACCOUNT_SIZE } from "../config";

interface Schema extends Omit<MarginSchema, "collateral"> {
  collateral: Num[];
}

export default class Margin extends BaseAccount<Schema, "margin"> {
  private constructor(
    pubkey: PublicKey,
    accClient: "margin",
    data: Schema,
    public readonly control: Control,
    public readonly state: State,
  ) {
    super(pubkey, accClient, data);
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
    const clientName = "margin";
    let data = await this.fetch(key, st);
    let control = await Control.load(data.control);
    return new this(key, clientName, data, control, st);
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
        instructions: [
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
  ): Promise<Control["data"]["openOrdersAgg"][0]> {
    const marketIndex = this.state.getSymbolIndex(symbol);
    let oo = this.control.data.openOrdersAgg[marketIndex];
    if (oo!.key.equals(PublicKey.default)) {
      await this.createPerpOpenOrders(symbol);
      oo = this.control.data.openOrdersAgg[marketIndex];
    }
    return oo!;
  }

  async deposit(
    tokenAccount: PublicKey,
    vault: PublicKey,
    amount: BN,
    repayOnly: boolean,
  ): Promise<void> {
    await this.program.rpc.deposit!(repayOnly, amount, {
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
    await this.refresh();
  }

  async withdraw(
    tokenAccount: PublicKey,
    vault: PublicKey,
    amount: BN,
  ): Promise<void> {
    await this.program.rpc.withdraw!(amount, {
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
    await this.refresh();
  }

  async createPerpOpenOrders(symbol: string) {
    const [ooKey, _] = await this.getOpenOrdersKey(symbol);
    await this.program.rpc.createPerpOpenOrders({
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
    await this.refresh();
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

    await this.program.rpc.placePerpOrder(
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
          openOrders: oo.key,
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
    await this.refresh();
  }

  async cancelPerpOrder(symbol: string, isLong: boolean, orderId: BN) {
    const market = await this.state.getSymbolMarket(symbol);
    const oo = await this.getSymbolOpenOrders(symbol);

    await this.program.rpc.cancelPerpOrder(orderId, isLong, {
      accounts: {
        state: this.state.pubkey,
        cache: this.state.cache.pubkey,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        control: this.control.pubkey,
        openOrders: oo.key,
        dexMarket: market.address,
        marketBids: market.bidsAddress,
        marketAsks: market.asksAddress,
        eventQ: market.eventQueueAddress,
        dexProgram: DEX_PROGRAM_ID,
      },
    });
  }
}
