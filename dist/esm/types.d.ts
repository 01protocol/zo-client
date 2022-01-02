import { PublicKey, Transaction } from "@solana/web3.js";
import { IdlAccounts, IdlTypes } from "@project-serum/anchor";
import BN from "bn.js";
import { Zo } from "./types/zo";
export interface Wallet {
    publicKey: PublicKey;
    signTransaction(tx: Transaction): Promise<Transaction>;
    signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}
export declare type TransactionId = string;
export { Zo } from "./types/zo";
export declare type OracleType = {
    pyth: {};
} | {
    switchboard: {};
};
export declare type PerpType = {
    future: {};
} | {
    callOption: {};
} | {
    putOption: {};
};
export declare type OrderType = {
    limit: {};
} | {
    immediateOrCancel: {};
} | {
    postOnly: {};
};
declare type WrappedI80F48 = {
    data: BN;
};
declare type Symbol = {
    data: number[];
};
declare type OracleSource = IdlTypes<Zo>["OracleSource"] & {
    ty: OracleType;
};
declare type CollateralInfo = Omit<IdlTypes<Zo>["CollateralInfo"], "oracleSymbol"> & {
    oracleSymbol: Symbol;
};
declare type PerpMarketInfo = Omit<IdlTypes<Zo>["PerpMarketInfo"], "symbol" | "oracleSymbol" | "perpType"> & {
    symbol: Symbol;
    oracleSymbol: Symbol;
    perpType: PerpType;
};
declare type OpenOrdersInfo = IdlTypes<Zo>["OpenOrdersInfo"];
declare type TwapInfo = Omit<IdlTypes<Zo>["TwapInfo"], "cumulAvg" | "open" | "high" | "low" | "close" | "lastSampleStartTime"> & {
    cumulAvg: WrappedI80F48;
    open: WrappedI80F48;
    high: WrappedI80F48;
    low: WrappedI80F48;
    close: WrappedI80F48;
    lastSampleStartTime: BN;
};
declare type OracleCache = Omit<IdlTypes<Zo>["OracleCache"], "symbol"> & {
    symbol: Symbol;
    sources: OracleSource[];
    price: WrappedI80F48;
    twap: WrappedI80F48;
};
declare type MarkCache = Omit<IdlTypes<Zo>["MarkCache"], "price" | "twap"> & {
    price: WrappedI80F48;
    twap: TwapInfo;
};
declare type BorrowCache = Omit<IdlTypes<Zo>["BorrowCache"], "supply" | "borrows" | "supplyMultiplier" | "borrowMultiplier"> & {
    supply: WrappedI80F48;
    borrows: WrappedI80F48;
    supplyMultiplier: WrappedI80F48;
    borrowMultiplier: WrappedI80F48;
};
export declare type StateSchema = IdlAccounts<Zo>["state"] & {
    collaterals: CollateralInfo[];
    perpMarkets: PerpMarketInfo[];
};
export declare type MarginSchema = Omit<IdlAccounts<Zo>["margin"], "collateral"> & {
    collateral: WrappedI80F48[];
};
export declare type CacheSchema = IdlAccounts<Zo>["cache"] & {
    oracles: OracleCache[];
    marks: MarkCache[];
    borrowCache: BorrowCache[];
};
export declare type ControlSchema = IdlAccounts<Zo>["control"] & {
    openOrdersAgg: OpenOrdersInfo[];
};
