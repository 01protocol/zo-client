import { PublicKey } from "@solana/web3.js";
import { BN, Program } from "@project-serum/anchor";
import Decimal from "decimal.js";
import BaseAccount from "./BaseAccount";
import { Schema as StateSchema } from "./State";
import Num from "../Num";
import { CacheSchema, Zo } from "../types";
import { loadSymbol, loadWI80F48 } from "../utils";

type OracleCache = Omit<
  CacheSchema["oracles"][0],
  "symbol" | "price" | "twap"
> & {
  symbol: string;
  price: Num;
  twap: Num;
};

type MarkCache = Omit<CacheSchema["marks"][0], "price" | "twap"> & {
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

type BorrowCache = Omit<
  CacheSchema["borrowCache"][0],
  "supply" | "borrows" | "supplyMultiplier" | "borrowMultiplier"
> & {
  rawSupply: Decimal;
  actualSupply: Num;
  actualBorrows: Num;
  supplyMultiplier: Decimal;
  borrowMultiplier: Decimal;
};

type Schema = Omit<CacheSchema, "oracles" | "marks" | "borrowCache"> & {
  oracles: OracleCache[];
  marks: MarkCache[];
  borrowCache: BorrowCache[];
};

/**
 * The Cache account stores and tracks oracle prices, mark prices, funding and borrow lending multipliers.
 */
export default class Cache extends BaseAccount<Schema> {
  private constructor(
    program: Program<Zo>,
    k: PublicKey,
    data: Schema,
    private readonly _st: StateSchema,
  ) {
    super(program, k, data);
  }

  /**
   * Loads a new Cache object from its public key.
   * @param program
   * @param k The cache account's public key.
   * @param st
   */
  static async load(program: Program<Zo>, k: PublicKey, st: StateSchema) {
    return new this(program, k, await Cache.fetch(program, k, st), st);
  }

  private static async fetch(
    program: Program<Zo>,
    k: PublicKey,
    st: StateSchema,
  ): Promise<Schema> {
    const data = (await program.account["cache"].fetch(
      k,
      "recent",
    )) as CacheSchema;
    return Cache.processRawCacheData(data, st);
  }

  private static processRawCacheData(
    data: CacheSchema,
    st: StateSchema,
  ): Schema {
    return {
      ...data,
      oracles: data.oracles
        //@ts-ignore
        .filter((c) => !c.symbol.data.every((x) => x === 0))
        .map((c) => {
          const decimals = c.quoteDecimals - c.baseDecimals;
          return {
            ...c,
            //@ts-ignore
            symbol: loadSymbol(c.symbol),
            price: Num.fromWI80F48(c.price, decimals),
            twap: Num.fromWI80F48(c.twap, decimals),
          };
        }),
      marks: st.perpMarkets.map((m, i) => {
        const decimals = 6 - m.assetDecimals;
        const c = data.marks[i]!;
        return {
          ...c,
          price: Num.fromWI80F48(c.price, decimals),
          twap: {
            cumulAvg: Num.fromWI80F48(c.twap.cumulAvg, decimals),
            open: Num.fromWI80F48(c.twap.open, decimals),
            high: Num.fromWI80F48(c.twap.high, decimals),
            low: Num.fromWI80F48(c.twap.low, decimals),
            close: Num.fromWI80F48(c.twap.close, decimals),
            lastSampleStartTime: new Date(
              c.twap.lastSampleStartTime.toNumber() * 1000,
            ),
          },
        };
      }),
      borrowCache: st.collaterals.map((col, i) => {
        const decimals = col.decimals;
        const c = data.borrowCache[i]!;
        const rawSupply = loadWI80F48(c.supply);
        const rawBorrows = loadWI80F48(c.borrows);
        const supplyMultiplier = loadWI80F48(c.supplyMultiplier);
        const borrowMultiplier = loadWI80F48(c.borrowMultiplier);
        return {
          ...c,
          rawSupply,
          actualSupply: new Num(
            new BN(rawSupply.times(supplyMultiplier).floor().toString()),
            decimals,
          ),
          rawBorrows,
          actualBorrows: new Num(
            new BN(rawBorrows.times(borrowMultiplier).ceil().toString()),
            decimals,
          ),
          supplyMultiplier,
          borrowMultiplier,
        };
      }),
    };
  }

  async refresh(): Promise<void> {
    this.data = await Cache.fetch(this.program, this.pubkey, this._st);
  }

  /**
   * @param sym The collateral symbol. Ex: ("BTC")
   * @returns The oracle cache for the given collateral.
   */
  getOracleBySymbol(sym: string): OracleCache {
    const i = this.data.oracles.findIndex((x) => x.symbol === sym);
    if (i < 0) {
      throw RangeError(
        `Invalid symbol ${sym} for <Cache ${this.pubkey.toBase58()}>`,
      );
    }
    return this.data.oracles[i]!;
  }
}
