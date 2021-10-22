import { Zo } from "./types/zo";
import { PublicKey, Transaction } from "@solana/web3.js";
import { IdlTypes, IdlAccounts } from "@project-serum/anchor";
import BN from "bn.js";

// TODO: DEPRECATE
export interface MarketInfo {
  name: string;
  address: PublicKey;
  programId: PublicKey;
}

// TODO: DEPRECATE
export interface Wallet {
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}

export { Zo } from "./types/zo";

export type OracleType = { pyth: {} } | { switchboard: {} };
export type PerpType = { future: {} } | { callOption: {} } | { putOption: {} };
export type OrderType =
  | { limit: {} }
  | { immediateOrCancel: {} }
  | { postOnly: {} };

// NOTE: These intersection types are a temporary workaround,
// as anchor's type inference isn't complete yet.
type WrappedI80F48 = { data: BN };
type OracleInfo = IdlTypes<Zo>["OracleInfo"] & {
  oracleType: OracleType;
  fallbackOracle: OracleType;
};
type CollateralInfo = IdlTypes<Zo>["CollateralInfo"] & {
  oracle: OracleInfo;
};
type PerpMarketInfo = IdlTypes<Zo>["PerpMarketInfo"] & {
  perpType: PerpType;
  oracle: OracleInfo;
};
type OpenOrdersInfo = IdlTypes<Zo>["OpenOrdersInfo"];
type OracleCache = IdlTypes<Zo>["OracleCache"] & {
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

export type StateSchema = IdlAccounts<Zo>["state"] & {
  collaterals: CollateralInfo[];
  perpMarkets: PerpMarketInfo[];
};
export type MarginSchema = IdlAccounts<Zo>["margin"];
export type CacheSchema = IdlAccounts<Zo>["cache"] & {
  oracleCache: OracleCache[];
  markCache: MarkCache[];
};
export type ControlSchema = IdlAccounts<Zo>["control"] & {
  openOrdersAgg: OpenOrdersInfo[];
};
