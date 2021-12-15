import { Zo } from "./types/zo";
import { PublicKey, Transaction } from "@solana/web3.js";
import { IdlTypes, IdlAccounts } from "@project-serum/anchor";
import BN from "bn.js";

export interface Wallet {
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}

export { Zo } from "./types/zo";

// NOTE: These intersection types are a temporary workaround,
// as anchor's type inference isn't complete yet.

export type OracleType = { pyth: {} } | { switchboard: {} };
export type PerpType = { future: {} } | { callOption: {} } | { putOption: {} };
export type OrderType =
  | { limit: {} }
  | { immediateOrCancel: {} }
  | { postOnly: {} };

type WrappedI80F48 = { data: BN };
type Symbol = { data: number[] };
type OracleSource = IdlTypes<Zo>["OracleSource"] & {
  ty: OracleType;
};
type CollateralInfo = Omit<IdlTypes<Zo>["CollateralInfo"], "oracleSymbol"> & {
  oracleSymbol: Symbol;
};
type PerpMarketInfo = Omit<
  IdlTypes<Zo>["PerpMarketInfo"],
  "symbol" | "oracleSymbol" | "perpType"
> & {
  symbol: Symbol;
  oracleSymbol: Symbol;
  perpType: PerpType;
};
type OpenOrdersInfo = IdlTypes<Zo>["OpenOrdersInfo"];

type OracleCache = Omit<IdlTypes<Zo>["OracleCache"], "symbol"> & {
  symbol: Symbol;
  sources: OracleSource[];
  price: WrappedI80F48;
  twap: WrappedI80F48;
};
type MarkCache = IdlTypes<Zo>["MarkCache"] & {
  price: WrappedI80F48;
  twap: {
    startTime: BN;
    open: WrappedI80F48;
    low: WrappedI80F48;
    high: WrappedI80F48;
    close: WrappedI80F48;
  }[];
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
