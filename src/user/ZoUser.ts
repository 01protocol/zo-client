import { ZoDBUser } from "./zoDBUser/ZoDBUser";
import { Wallet } from "../types";
import { Commitment, Connection, Keypair } from "@solana/web3.js";
import { Cluster, createProgram, OrderInfo, PositionInfo } from "../utils";
import { Provider } from "@project-serum/anchor";
import { ZO_DEVNET_STATE_KEY, ZO_MAINNET_STATE_KEY } from "../config";
import { Margin, State } from "../index";
import Decimal from "decimal.js";
import BN from "bn.js";

export class ZoUser extends ZoDBUser {
  get state() {
    return this.margin.state;
  }

  get orders() {
    return this.margin.orders;
  }

  get balances() {
    return this.margin.balances;
  }

  get positions() {
    return this.margin.positions;
  }

  position(marketKey: string) {
    return this.margin.position(marketKey);
  }

  get markets() {
    return this.margin.state.markets;
  }

  get assets() {
    return this.margin.state.assets;
  }

  get funding(): Decimal {
    return this.margin.funding;
  }

  getPositionFunding(positionOrMarketKey: PositionInfo | string) {
    if (typeof positionOrMarketKey == "string") {
      return this.margin.getPositionFunding(this.position(positionOrMarketKey));
    }
    return this.margin.getPositionFunding(positionOrMarketKey);
  }

  positionPnL(positionOrMarketKey: PositionInfo | string) {
    if (typeof positionOrMarketKey == "string") {
      return this.margin.positionPnL(this.position(positionOrMarketKey));
    }
    return this.margin.positionPnL(positionOrMarketKey);
  }

  positionPnLBasedOnMarkPrice(positionOrMarketKey: PositionInfo | string) {
    if (typeof positionOrMarketKey == "string") {
      return this.margin.positionPnLBasedOnMarkPrice(
        this.position(positionOrMarketKey),
      );
    }
    return this.margin.positionPnLBasedOnMarkPrice(positionOrMarketKey);
  }

  positionFunding(positionOrMarketKey: PositionInfo | string) {
    if (typeof positionOrMarketKey == "string") {
      return this.margin.positionFunding(this.position(positionOrMarketKey));
    }
    return this.margin.positionFunding(positionOrMarketKey);
  }

  get unweightedCollateralValue(): Decimal {
    return this.margin.unweightedCollateralValue;
  }

  get unweightedAccountValue(): Decimal {
    return this.margin.unweightedAccountValue;
  }

  get maintenanceMarginFraction(): Decimal {
    return this.margin.maintenanceMarginFraction;
  }

  get openMarginFraction(): Decimal {
    return this.margin.openMarginFraction;
  }

  get marginFraction(): Decimal {
    return this.margin.marginFraction;
  }

  get totalPositionNotional(): Decimal {
    return this.margin.totalPositionNotional;
  }

  longOrderSize(marketKey: string): Decimal {
    return this.margin.longOrderSize(marketKey);
  }

  shortOrderSize(marketKey: string): Decimal {
    return this.margin.shortOrderSize(marketKey);
  }

  openSize(marketKey: string): Decimal {
    return this.margin.shortOrderSize(marketKey);
  }

  get totalOpenPositionNotional(): Decimal {
    return this.margin.totalPositionNotional;
  }

  get tiedCollateral(): Decimal {
    return this.margin.totalPositionNotional;
  }

  get freeCollateralValue(): Decimal {
    return this.margin.totalPositionNotional;
  }

  get cumulativeUnrealizedPnL(): Decimal {
    return this.margin.totalPositionNotional;
  }

  collateralWithdrawable(marketKey: string): Decimal {
    return this.margin.collateralWithdrawable(marketKey);
  }

  collateralWithdrawableWithBorrow(marketKey: string): Decimal {
    return this.margin.collateralWithdrawable(marketKey);
  }

  getOrderByOrderId(orderId: string | BN): OrderInfo | null {
    return this.margin.getOrderByOrderId(orderId);
  }

  getBestAsk(marketKey: string): number {
    return this.state.getBestAsk(marketKey);
  }

  getBestBid(marketKey: string): number {
    return this.state.getBestBid(marketKey);
  }

  async subscribe() {
    await this.margin.subscribe();
  }

  async unsubscribe() {
    await this.margin.unsubscribe();
  }

  static async load(
    account: Wallet | Keypair,
    cluster: Cluster,
    connection: Connection,
    opts: {
      withRealm: boolean;
      commitment?: Commitment;
      skipPreflight?: boolean;
      rpcUrl?: string;
    },
  ) {
    let wallet: Wallet;
    if (account instanceof Keypair) {
      wallet = {
        publicKey: account.publicKey,
        signTransaction: async (tx) => {
          await tx.sign(account);
          return tx;
        },
        signAllTransactions: async (txs) => {
          for (const tx of txs) {
            await tx.sign(account);
          }
          return txs;
        },
      };
    } else {
      wallet = account;
    }

    const provider = new Provider(connection, wallet, {
      commitment: opts.commitment,
      skipPreflight: opts.skipPreflight,
    });
    const program = createProgram(provider, cluster);
    const stateKey =
      cluster == Cluster.Devnet ? ZO_DEVNET_STATE_KEY : ZO_MAINNET_STATE_KEY;
    const state = await State.load(program, stateKey, opts.commitment);
    const margin = await Margin.load(
      program,
      state,
      null,
      wallet.publicKey,
      opts.commitment,
    );
    let realm, realmConnected;
    if (opts.withRealm) {
      const credentials = Realm.Credentials.anonymous();
      const app = Realm.App.getApp("01-lgbct");
      realm = await app.logIn(credentials);
      realmConnected = true;
    }
    return new ZoUser(margin, realm, realmConnected);
  }
}
