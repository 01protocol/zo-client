import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import Decimal from "decimal.js";
import BaseAccount from "./BaseAccount";
import { Schema as StateSchema } from "./State";
import Num from "../Num";
import { CacheSchema, Zo } from "../types";
declare type OracleCache = Omit<CacheSchema["oracles"][0], "symbol" | "price" | "twap"> & {
    symbol: string;
    price: Num;
    twap: Num;
};
declare type MarkCache = Omit<CacheSchema["marks"][0], "price" | "twap"> & {
    price: Num;
    twap: {
        cumulAvg: Num;
        open: Num;
        low: Num;
        high: Num;
        close: Num;
        lastSampleStartTime: Date;
    };
};
declare type BorrowCache = Omit<CacheSchema["borrowCache"][0], "supply" | "borrows" | "supplyMultiplier" | "borrowMultiplier"> & {
    rawSupply: Decimal;
    actualSupply: Num;
    actualBorrows: Num;
    supplyMultiplier: Decimal;
    borrowMultiplier: Decimal;
};
declare type Schema = Omit<CacheSchema, "oracles" | "marks" | "borrowCache"> & {
    oracles: OracleCache[];
    marks: MarkCache[];
    borrowCache: BorrowCache[];
};
/**
 * The Cache account stores and tracks oracle prices, mark prices, funding and borrow lending multipliers.
 */
export default class Cache extends BaseAccount<Schema> {
    private readonly _st;
    private constructor();
    /**
     * Loads a new Cache object from its public key.
     * @param k The cache account's public key.
     */
    static load(program: Program<Zo>, k: PublicKey, st: StateSchema): Promise<Cache>;
    private static fetch;
    refresh(): Promise<void>;
    /**
     * @param sym The collateral symbol. Ex: ("BTC")
     * @returns The oracle cache for the given collateral.
     */
    getOracleBySymbol(sym: string): OracleCache;
}
export {};
