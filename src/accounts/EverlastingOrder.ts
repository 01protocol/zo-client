import { DEX_PROGRAM_ID } from "../config";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { AccountClient, BN, Program } from "@project-serum/anchor";
import { createTokenAccount } from "../utils";
import BaseAccount from "./BaseAccount";
import EverlastingMarket from "./EverlastingMarket";
import Margin from "./Margin";
import { Market, OpenOrders, Order } from "../serum/market";

export interface Schema {
  nonce: number;
  authority: PublicKey;
  assetAccount: PublicKey;
  everMarket: PublicKey;
  openOrders: PublicKey;
}

export enum DexOrderType {
  Limit,
  ImmediateOrCancel,
  PostOnly,
}

export default class EverlastingOrder extends BaseAccount<Schema> {
  private constructor(
    pubKey: PublicKey,
    program: Program,
    accountClient: AccountClient,
    data: Readonly<Schema>,
    public readonly openOrdersAcc: OpenOrders,
  ) {
    super(pubKey, program, accountClient, data);
  }

  static async init({
    program,
    margin,
    market,
  }: Readonly<{
    program: Program;
    margin: Margin;
    market: EverlastingMarket;
  }>): Promise<EverlastingOrder> {
    const conn = program.provider.connection;
    const wallet = program.provider.wallet;
    const { key, nonce } = await this.getKeyAndNonce(wallet, program);

    const ooKey = Keypair.generate();
    const traderAssetAccount = await createTokenAccount(
      program.provider,
      market.data.vAssetMint,
      margin.pubKey,
    );

    await program.rpc.initEverlastingOrder!(nonce, {
      accounts: {
        authority: wallet.publicKey,
        margin: margin.pubKey,
        traderAssetAccount: traderAssetAccount,
        everOrder: key,
        openOrders: ooKey.publicKey,
        everMarket: market.pubKey,
        dexMarket: market.data.dexMarket,
        dexProgram: DEX_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
      instructions: [
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: ooKey.publicKey,
          lamports: await conn.getMinimumBalanceForRentExemption(
            12 + 8 * 409 + 16,
          ),
          space: 12 + 8 * 409 + 16,
          programId: DEX_PROGRAM_ID,
        }),
      ],
      signers: [ooKey],
    });

    return await this.load(key, program);
  }

  private static async getKeyAndNonce(wallet: any, program: Program) {
    const [key, nonce] = await PublicKey.findProgramAddress(
      [wallet.publicKey.toBuffer(), Buffer.from("orderv1")],
      program.programId,
    );
    return { key, nonce };
  }

  async newOrder({
    program,
    margin,
    market,
    isLong,
    limitPrice,
    maxBaseQty,
    maxQuoteQty,
    orderType,
  }: Readonly<{
    program: Program;
    margin: Margin;
    market: EverlastingMarket;
    isLong: boolean;
    limitPrice: BN; // in decimals
    maxBaseQty: BN; // in lots
    maxQuoteQty: BN; // in decimals
    orderType: DexOrderType;
  }>): Promise<void> {
    const wallet = program.provider.wallet;

    let type: any;
    switch (orderType) {
      case DexOrderType.Limit:
        type = {
          limit: {},
        };
        break;
      case DexOrderType.ImmediateOrCancel:
        type = {
          immediateOrCancel: {},
        };
        break;
      case DexOrderType.PostOnly:
        type = {
          postOnly: {},
        };
        break;
      default:
        throw new Error("Unknown order type: " + orderType);
    }

    await program.rpc.newEverlastingOrder!(
      isLong,
      limitPrice,
      maxBaseQty,
      maxQuoteQty,
      type,
      {
        accounts: {
          authority: wallet.publicKey,
          margin: margin.pubKey,
          traderAssetAccount: this.data.assetAccount,
          everOrder: this.pubKey,
          openOrders: this.data.openOrders,
          everMarket: market.pubKey,
          dexMarket: market.data.dexMarket,
          reqQ: market.data.reqQ,
          eventQ: market.data.eventQ,
          marketBids: market.data.bids,
          marketAsks: market.data.asks,
          vAssetMint: market.data.vAssetMint,
          vAssetVault: market.data.vAssetVault,
          vQuoteMint: market.data.vQuoteMint,
          vQuoteVault: market.data.vQuoteVault,
          dexProgram: DEX_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
      },
    );
  }

  async cancelOrder({
    program,
    margin,
    market,
    orderId,
    isLong,
  }: Readonly<{
    program: Program;
    margin: Margin;
    market: EverlastingMarket;
    orderId: BN;
    isLong: boolean;
  }>): Promise<void> {
    const wallet = program.provider.wallet;

    await program.rpc.cancelEverlastingOrder!(orderId, isLong, {
      accounts: {
        authority: wallet.publicKey,
        margin: margin.pubKey,
        order: this.pubKey,
        openOrders: this.data.openOrders,
        everMarket: market.pubKey,
        dexMarket: market.data.dexMarket,
        eventQ: market.data.eventQ,
        marketBids: market.data.bids,
        marketAsks: market.data.asks,
        dexProgram: DEX_PROGRAM_ID,
      },
    });
  }

  // Returns all orders currently on the book
  static async getActiveOrders(
    program: Program,
    margin: Margin,
    dexMarketAcc: Market,
  ): Promise<Order[]> {
    return await dexMarketAcc.loadOrdersForOwner(
      program.provider.connection,
      margin.pubKey,
    );
  }

  static async load(
    pubkey: PublicKey,
    program: Program,
  ): Promise<EverlastingOrder> {
    const client = program.account.everlastingOrder!;
    const data = (await client.fetch(pubkey)) as Schema;
    return new this(
      pubkey,
      program,
      client,
      data,
      await OpenOrders.load(
        program.provider.connection,
        data.openOrders,
        DEX_PROGRAM_ID,
      ),
    );
  }

  static async loadFromWallet(program: Program): Promise<EverlastingOrder> {
    const wallet = program.provider.wallet;
    const { key } = await this.getKeyAndNonce(wallet, program);

    return await this.load(key, program);
  }

  static async forceCancel({
    marginKey,
    everOrder,
    market,
    limit,
    program,
  }: Readonly<{
    marginKey: PublicKey;
    everOrder: EverlastingOrder;
    market: EverlastingMarket;
    limit: number;
    program: Program;
  }>) {
    await program.rpc.forcePruneOrders!(limit, {
      accounts: {
        pruner: program.provider.wallet.publicKey,
        margin: marginKey,
        order: everOrder.pubKey,
        everMarket: market.pubKey,
        openOrders: everOrder.data.openOrders,
        dexMarket: market.data.dexMarket,
        marketBids: market.data.bids,
        marketAsks: market.data.asks,
        eventQ: market.data.eventQ,
        dexProgram: DEX_PROGRAM_ID,
      },
    });
  }

  // force closes positions of a trader under liquidation by sending market orders
  static async forceClosePosition({
    marginKey,
    everOrder,
    market,
    program,
  }: Readonly<{
    marginKey: PublicKey;
    everOrder: EverlastingOrder;
    market: EverlastingMarket;
    program: Program;
  }>) {
    const tx = await program.rpc.forceCloseEverlastingPosition!({
      accounts: {
        liquidator: program.provider.wallet.publicKey,
        margin: marginKey,
        traderAssetAccount: everOrder.data.assetAccount,
        order: everOrder.pubKey,
        openOrders: everOrder.data.openOrders,
        everMarket: market.pubKey,
        dexMarket: market.data.dexMarket,
        reqQ: market.data.reqQ,
        eventQ: market.data.eventQ,
        marketBids: market.data.bids,
        marketAsks: market.data.asks,
        vAssetMint: market.data.vAssetMint,
        vAssetVault: market.data.vAssetVault,
        vQuoteMint: market.data.vQuoteMint,
        vQuoteVault: market.data.vQuoteVault,
        dexProgram: DEX_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    });

    console.log("tx: ", tx);
  }
}
