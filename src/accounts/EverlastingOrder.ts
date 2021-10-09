import { DEX_PROGRAM_ID } from "../config";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BN } from "@project-serum/anchor";
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
    accountClientName: string,
    data: Readonly<Schema>,
    public readonly openOrders: OpenOrders,
  ) {
    super(pubKey, accountClientName, data);
  }

  static async init({
    margin,
    market,
  }: Readonly<{
    margin: Margin;
    market: EverlastingMarket;
  }>): Promise<EverlastingOrder> {
    const { key, nonce } = await this.getKeyAndNonce();

    const ooKey = Keypair.generate();
    const traderAssetAccount = await createTokenAccount(
      this.provider,
      market.data.vAssetMint,
      margin.pubKey,
    );

    await this.program.rpc.initEverlastingOrder!(nonce, {
      accounts: {
        authority: this.wallet.publicKey,
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
          fromPubkey: this.wallet.publicKey,
          newAccountPubkey: ooKey.publicKey,
          lamports: await this.connection.getMinimumBalanceForRentExemption(
            12 + 8 * 409 + 16,
          ),
          space: 12 + 8 * 409 + 16,
          programId: DEX_PROGRAM_ID,
        }),
      ],
      signers: [ooKey],
    });

    return await this.load(key);
  }

  private static async getKeyAndNonce() {
    const [key, nonce] = await PublicKey.findProgramAddress(
      [this.wallet.publicKey.toBuffer(), Buffer.from("orderv1")],
      this.program.programId,
    );
    return { key, nonce };
  }

  async newOrder({
    margin,
    market,
    isLong,
    limitPrice,
    maxBaseQty,
    maxQuoteQty,
    orderType,
  }: Readonly<{
    margin: Margin;
    market: EverlastingMarket;
    isLong: boolean;
    limitPrice: BN; // in decimals
    maxBaseQty: BN; // in lots
    maxQuoteQty: BN; // in decimals
    orderType: DexOrderType;
  }>): Promise<void> {
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

    await this.program.rpc.newEverlastingOrder!(
      isLong,
      limitPrice,
      maxBaseQty,
      maxQuoteQty,
      type,
      {
        accounts: {
          authority: this.wallet.publicKey,
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
    margin,
    market,
    orderId,
    isLong,
  }: Readonly<{
    margin: Margin;
    market: EverlastingMarket;
    orderId: BN;
    isLong: boolean;
  }>): Promise<void> {
    await this.program.rpc.cancelEverlastingOrder!(orderId, isLong, {
      accounts: {
        authority: this.wallet.publicKey,
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
    margin: Margin,
    dexMarket: Market,
  ): Promise<Order[]> {
    return await dexMarket.loadOrdersForOwner(
      this.provider.connection,
      margin.pubKey,
    );
  }

  static async load(pubkey: PublicKey): Promise<EverlastingOrder> {
    const clientName = "everlastingOrder";
    const data = (await this.program.account[clientName]!.fetch(
      pubkey,
    )) as Schema;
    return new this(
      pubkey,
      clientName,
      data,
      await OpenOrders.load(
        this.program.provider.connection,
        data.openOrders,
        DEX_PROGRAM_ID,
      ),
    );
  }

  static async loadFromWallet(): Promise<EverlastingOrder> {
    const { key } = await this.getKeyAndNonce();
    return await this.load(key);
  }

  static async forceCancel({
    marginKey,
    everOrder,
    market,
    limit,
  }: Readonly<{
    marginKey: PublicKey;
    everOrder: EverlastingOrder;
    market: EverlastingMarket;
    limit: number;
  }>) {
    await this.program.rpc.forcePruneOrders!(limit, {
      accounts: {
        pruner: this.wallet.publicKey,
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
  }: Readonly<{
    marginKey: PublicKey;
    everOrder: EverlastingOrder;
    market: EverlastingMarket;
  }>) {
    const tx = await this.program.rpc.forceCloseEverlastingPosition!({
      accounts: {
        liquidator: this.wallet.publicKey,
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
