import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import BaseAccount from "./BaseAccount";
import { CacheSchema } from "../types";
import { loadSymbol, loadWrappedI80F48 } from "../utils";

type OracleCache = Omit<
  CacheSchema["oracles"][0],
  "symbol" | "price" | "twap"
> & {
  symbol: string;
  price: Decimal;
  twap: Decimal;
};

type MarkCache = Omit<CacheSchema["marks"][0], "price" | "twap"> & {
  price: Decimal;
  twap: {
    startTime: Date;
    open: Decimal;
    low: Decimal;
    high: Decimal;
    close: Decimal;
  }[];
};

type BorrowCache = Omit<
  CacheSchema["borrowCache"][0],
  "supply" | "borrows" | "supplyMultiplier" | "borrowMultiplier"
> & {
  supply: Decimal;
  borrows: Decimal;
  supplyMultiplier: Decimal;
  borrowMultiplier: Decimal;
};

type Schema = Omit<CacheSchema, "oracles" | "marks" | "borrowCache"> & {
  oracles: OracleCache[];
  marks: MarkCache[];
  borrowCache: BorrowCache[];
};

export default class Cache extends BaseAccount<Schema> {
  static async fetch(k: PublicKey): Promise<Schema> {
    const data = (await this.program.account["cache"].fetch(k)) as CacheSchema;
    return {
      ...data,
      oracles: data.oracles
        .filter((c) => !c.symbol.data.every((x) => x === 0))
        .map((c) => ({
          ...c,
          symbol: loadSymbol(c.symbol),
          price: loadWrappedI80F48(c.price),
          twap: loadWrappedI80F48(c.twap),
        })),
      marks: data.marks
        .map((c) => ({
          ...c,
          price: loadWrappedI80F48(c.price),
          twap: c.twap.map((x) => ({
            ...x,
            startTime: new Date(x.startTime.toNumber()),
            open: loadWrappedI80F48(x.open),
            low: loadWrappedI80F48(x.low),
            high: loadWrappedI80F48(x.high),
            close: loadWrappedI80F48(x.close),
          })),
        })),
      borrowCache: data.borrowCache.map((c) => ({
        ...c,
        supply: loadWrappedI80F48(c.supply),
        borrows: loadWrappedI80F48(c.borrows),
        supplyMultiplier: loadWrappedI80F48(c.supplyMultiplier),
        borrowMultiplier: loadWrappedI80F48(c.borrowMultiplier),
      })),
    };
  }

  async refresh(): Promise<void> {
    this.data = await Cache.fetch(this.pubkey);
  }

  static async load(k: PublicKey) {
    return new this(k, await Cache.fetch(k));
  }
}
