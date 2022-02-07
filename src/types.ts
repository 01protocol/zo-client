import { PublicKey, Transaction } from "@solana/web3.js";
import { IdlAccounts, IdlTypes } from "@project-serum/anchor";
import BN from "bn.js";
import { Zo } from "./types/zo";

export interface Wallet {
  publicKey: PublicKey;

  signTransaction(tx: Transaction): Promise<Transaction>;

  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}

export type TransactionId = string;

// NOTE: These intersection types are a temporary workaround,
// as anchor's type inference isn't complete yet.

export { Zo } from "./types/zo";

export type OracleType = { pyth: {} } | { switchboard: {} };
export type PerpType =
  | { future: {} }
  | { callOption: {} }
  | { putOption: {} }
  | { square: {} };
export type OrderType =
  | { limit: {} }
  | { immediateOrCancel: {} }
  | { postOnly: {} }
  | { reduceOnlyIoc: {} }
  | { reduceOnlyLimit: {} }
  | { fillOrKill: {} };

type WrappedI80F48 = { data: BN };
type Symbol = { data: number[] };
type OracleSource = IdlTypes<Zo>["OracleSource"] & {
  ty: OracleType;
};
type CollateralInfo = Omit<IdlTypes<Zo>["CollateralInfo"], "oracleSymbol"> & {
  oracleSymbol: symbol;
};
type PerpMarketInfo = Omit<
  IdlTypes<Zo>["PerpMarketInfo"],
  "symbol" | "oracleSymbol" | "perpType"
> & {
  symbol: symbol;
  oracleSymbol: symbol;
  perpType: PerpType;
};
type OpenOrdersInfo = IdlTypes<Zo>["OpenOrdersInfo"];
type TwapInfo = Omit<
  IdlTypes<Zo>["TwapInfo"],
  "cumulAvg" | "open" | "high" | "low" | "close" | "lastSampleStartTime"
> & {
  cumulAvg: WrappedI80F48;
  open: WrappedI80F48;
  high: WrappedI80F48;
  low: WrappedI80F48;
  close: WrappedI80F48;
  lastSampleStartTime: BN;
};

type OracleCache = Omit<IdlTypes<Zo>["OracleCache"], "symbol"> & {
  symbol: symbol;
  sources: OracleSource[];
  price: WrappedI80F48;
  twap: WrappedI80F48;
};
type MarkCache = Omit<IdlTypes<Zo>["MarkCache"], "price" | "twap"> & {
  price: WrappedI80F48;
  twap: TwapInfo;
};
type BorrowCache = Omit<
  IdlTypes<Zo>["BorrowCache"],
  "supply" | "borrows" | "supplyMultiplier" | "borrowMultiplier"
> & {
  supply: WrappedI80F48;
  borrows: WrappedI80F48;
  supplyMultiplier: WrappedI80F48;
  borrowMultiplier: WrappedI80F48;
};

export type StateSchema = IdlAccounts<Zo>["state"] & {
  collaterals: CollateralInfo[];
  perpMarkets: PerpMarketInfo[];
};
export type MarginSchema = Omit<IdlAccounts<Zo>["margin"], "collateral"> & {
  collateral: WrappedI80F48[];
};
export type CacheSchema = IdlAccounts<Zo>["cache"] & {
  oracles: OracleCache[];
  marks: MarkCache[];
  borrowCache: BorrowCache[];
};
export type ControlSchema = IdlAccounts<Zo>["control"] & {
  openOrdersAgg: OpenOrdersInfo[];
};
