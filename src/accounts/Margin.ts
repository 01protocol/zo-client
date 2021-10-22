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
import { MarginSchema as Schema, OrderType } from "../types";
import { DEX_PROGRAM_ID, CONTROL_ACCOUNT_SIZE } from "../config";

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

  private static processData(data: Schema): Schema {
    return {
      ...data,
    };
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

  async getOpenOrders(dexMarket: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [this.data.control.toBuffer(), dexMarket.toBuffer()],
      DEX_PROGRAM_ID,
    );
  }

  static async load(st: State): Promise<Margin> {
    const [key, _nonce] = await this.getPda(st, this.wallet.publicKey);
    const clientName = "margin";
    let data = this.processData(
      await this.program.account[clientName]!.fetch(key),
    );
    let control = await Control.load(data.control);
    return new this(key, clientName, data, control, st);
  }

  async refresh(): Promise<void> {
    this.data = Margin.processData(await this.accountClient.fetch(this.pubkey));
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
          state: this.state.pubkey,
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

  async deposit(
    tokenAccount: PublicKey,
    vault: PublicKey,
    amount: BN,
  ): Promise<void> {
    await this.program.rpc.deposit!(amount, {
      accounts: {
        state: this.state.pubkey,
        stateSigner: this.state.signer,
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

  async createPerpOpenOrders(symbol: string, dexMarket: PublicKey) {
    const [ooKey, _] = await this.getOpenOrders(dexMarket);
    await this.program.rpc.createPerpOpenOrders(symbol, {
      accounts: {
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        control: this.data.control,
        openOrders: ooKey,
        dexMarket,
        dexProgram: DEX_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
    });
  }

  async placePerpOrder({
    assetAccount,
    dexMarket,
    reqQ,
    eventQ,
    marketBids,
    marketAsks,
    isLong,
    limitPrice,
    maxBaseQty,
    maxQuoteQty,
    orderType,
    vAssetMint,
    vAssetVault,
    vQuoteMint,
    vQuoteVault,
    openOrders,
  }: Readonly<{
    assetAccount: PublicKey;
    dexMarket: PublicKey;
    reqQ: PublicKey;
    eventQ: PublicKey;
    marketBids: PublicKey;
    marketAsks: PublicKey;
    isLong: boolean;
    limitPrice: BN;
    maxBaseQty: BN;
    maxQuoteQty: BN;
    orderType: OrderType;
    vAssetMint: PublicKey;
    vAssetVault: PublicKey;
    vQuoteMint: PublicKey;
    vQuoteVault: PublicKey;
    openOrders: PublicKey;
  }>) {
    await this.program.rpc.placePerpOrder(
      isLong,
      limitPrice,
      maxBaseQty,
      maxQuoteQty,
      orderType,
      {
        accounts: {
          state: this.state.pubkey,
          cache: this.state.cache.pubkey,
          authority: this.wallet.publicKey,
          margin: this.pubkey,
          traderAssetAccount: assetAccount,
          control: this.control.pubkey,
          openOrders,
          dexMarket,
          reqQ,
          eventQ,
          marketBids,
          marketAsks,
          vAssetMint,
          vAssetVault,
          vQuoteMint,
          vQuoteVault,
          dexProgram: DEX_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
      },
    );
  }

  async cancelPerpOrder(orderId: BN, isLong: boolean) {
    await this.program.rpc.cancelPerpOrder(orderId, isLong, {
      accounts: {},
    });
  }
}
