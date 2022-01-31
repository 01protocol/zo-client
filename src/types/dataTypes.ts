import Num from "../Num";
import Decimal from "decimal.js";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export const ZERO = {
  decimal: () => new Decimal(0),
  bn: () => new BN(0),
  tab: () => new Num(0, 1),
};

export const ONE = {
  decimal: () => new Decimal(1),
  bn: () => new BN(1),
  tab: () => new Num(1, 1),
};

export enum MarketType {
  Perp,
  EverCall,
  EverPut,
  EverVolCall,
  EverVolPut,
}

export interface PositionInfo {
  coins: Num;
  pCoins: Num;
  realizedPnL: Num;
  fundingIndex: Decimal;
  marketKey: string;
  isLong: boolean;
}

export interface MarketInfo {
  pubKey: PublicKey;
  symbol: string;
  indexPrice: Num;
  markPrice: Num;
  pmmf: Decimal;
  baseImf: Decimal;
  fundingIndex: Decimal;
  marketType: MarketType;
  strike: number;
  assetDecimals: number;
  assetLotSize: number;
  quoteLotSize: number;
}

export type AssetInfo = {
  decimals: number,
  weight: number,
  liqFee: number,
  isBorrowable: boolean,
  optimalUtil: number,
  optimalRate: number,
  maxRate: number,
  ogFee: number,
  isSwappable: boolean,
  serumOpenOrders: PublicKey,
  maxDeposit: BN,
  dustThreshold: number,
  symbol: string;
  indexPrice: Num;
  supply: Decimal;
  borrows: Decimal;
  supplyApy: Decimal;
  borrowsApy: Decimal;
  mint: PublicKey;
  vault: PublicKey;
};


export interface OrderInfo {
  price: Num;
  coins: Num;
  pCoins: Num;
  orderId: BN;
  symbol: string;
  marketKey: string;
  long: boolean;
}

export enum OrderType {
  Market,
  Limit,
}

export interface TradeInfo {
  long: boolean;
  coins: number;
  pCoins: number;
  price: number;
  postOrder: boolean;
  iocOrder: boolean;
  marketKey: string;
  orderType: OrderType;
}
