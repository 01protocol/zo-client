import Decimal from "decimal.js"
import { OrderInfo, PositionInfo, SpecialOrderInfo } from "./dataTypes"

export enum ChangeType {
  UserBalanceChange="User Balance Changed",
  UserPositionChange="User Position Changed",
  StateBalanceChange="State Balance Changed",
  MarketPriceChange="Market Price Changed",
  MarketFundingChange="Market Funding Changed",
  UserOrderChange="User Order Changed",
}


export interface ChangeEvent<Y> {
  type: ChangeType
  prev: Y
  curr: Y
  time: Date
}

export interface UserBalanceChange extends ChangeEvent<{ balance: Decimal, key: string }> {
  type: ChangeType
}

export interface UserPositionChange extends ChangeEvent<PositionInfo> {
  type: ChangeType
}

export enum OrderChangeType {
  FilledOrCancelled,
  Placed,
  PartiallyFilled
}

export interface UserOrderChange extends ChangeEvent<OrderInfo | null> {
  type: ChangeType,
  orderChangeType: OrderChangeType
}

export interface UserSpecialOrderChange extends ChangeEvent<SpecialOrderInfo | null> {
  type: ChangeType,
  orderChangeType: OrderChangeType
}

export interface StateBalanceChange extends ChangeEvent<{
  supply: Decimal,
  borrows: Decimal,
  key: string
}> {
  type: ChangeType
}


export interface MarketFundingChange extends ChangeEvent<{
  fundingIndex: Decimal,
  key: string
}> {
  type: ChangeType
}


export interface MarketPriceChange extends ChangeEvent<{
  indexPrice: Decimal,
  markPrice: Decimal,
  key: string
}> {
  type: ChangeType
}
