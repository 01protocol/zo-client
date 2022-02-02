import Num from "../Num"
import Decimal from "decimal.js"
import { PublicKey } from "@solana/web3.js"
import BN from "bn.js"

export enum MarketType {
  Perp,
  EverCall,
  EverPut,
  EverVolCall,
  EverVolPut,
  SquaredPerp,
}

/**
 * @coins - number of base asset
 * @pCoins - number of quote
 * @realizedPnL - realized pnl(should be zero if cranked)
 * @fundingIndex - funding index at the time of the trade
 * @marketKey - market key
 * @isLong - long or short
 */
export interface PositionInfo {
  coins: Num;
  pCoins: Num;
  realizedPnL: Num;
  fundingIndex: Decimal;
  marketKey: string;
  isLong: boolean;
}

/**
 * @long - amount of coins on long orders
 * @short - amount of coins on short orders
 * @posSize - size of position
 * @isLong - long
 */
export interface OOInfo {
  long: Decimal,
  short: Decimal,
  posSize: Decimal,
  isLong: boolean,
}


/**
 *   @pubKey: public key
 *   @symbol: symbol
 *   @indexPrice: index price
 *   @indexTwap: twap index price
 *   @markPrice: mark price
 *   @pmmf: position margin fraction
 *   @baseImf: base asset IMF
 *   @fundingIndex: funding index
 *   @marketType: market type
 *   @strike: strike if everlasting option
 *   @assetDecimals: asset decimals
 *   @assetLotSize: asset lot size
 *   @quoteLotSize: quote lot size
 */
export interface MarketInfo {
  pubKey: PublicKey;
  symbol: string;
  indexPrice: Num;
  markPrice: Num;
  indexTwap: Num;
  markTwap: Num;
  pmmf: Decimal;
  baseImf: Decimal;
  fundingIndex: Decimal;
  marketType: MarketType;
  strike?: number;
  assetDecimals: number;
  assetLotSize: number;
  quoteLotSize: number;
}

/**
 *   @decimals - asset decimals
 *   @weight - col weight in per mille
 *   @liqFee - liquidation fee in per mille
 *   @isBorrowable - is asset borrowable
 *   @optimalUtil - optimal utilization in per mille
 *   @optimalRate - optimal rate in per mille
 *   @maxRate - max rate in per mille
 *   @ogFee - origination fee in bps
 *   @isSwappable - is asset swappable
 *   @serumOpenOrders - serum open orders key
 *   @maxDeposit - max deposit amount in smol
 *   @dustThreshold - dust threshold in smol
 *   @symbol - symbol
 *   @indexPrice - index price of an asset
 *   @supply - total supply
 *   @borrows - total borrows
 *   @supplyApy - supply apy
 *   @borrowsApy - borrows apy
 *   @mint - mint public key
 *   @vault - vault key
 */
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
  maxDeposit: Decimal,
  dustThreshold: Num,
  symbol: string;
  indexPrice: Num;
  supply: Decimal;
  borrows: Decimal;
  supplyApy: number;
  borrowsApy: number;
  mint: PublicKey;
  vault: PublicKey;
};


/**
 * @price
 * @coins
 * @pCoins
 * @orderId
 * @symbol
 * @marketKey
 * @long
 */
export interface OrderInfo {
  price: Num;
  coins: Num;
  pCoins: Num;
  orderId: BN;
  symbol: string;
  marketKey: string;
  long: boolean;
}

export enum OrderTypeInfo {
  Market,
  Limit,
}

/**
 * Trade Info
 * @long
 * @coins
 * @pCoins
 * @price
 * @price
 * @postOrder
 * @iocOrder
 * @marketKey
 * @orderType
 */
export interface TradeInfo {
  long: boolean;
  coins: number;
  pCoins: number;
  price: number;
  postOrder: boolean;
  iocOrder: boolean;
  orderType: OrderTypeInfo;
}
