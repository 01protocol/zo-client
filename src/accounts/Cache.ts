import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import Decimal from "decimal.js";
import BaseAccount from "./BaseAccount";
import { Schema as StateSchema } from "./State";
import Num from "../Num";
import { Zo, CacheSchema } from "../types";
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
    startTime: Date;
    open: Num;
    low: Num;
    high: Num;
    close: Num;
  }[];
};

type BorrowCache = Omit<
  CacheSchema["borrowCache"][0],
  "supply" | "borrows" | "supplyMultiplier" | "borrowMultiplier"
> & {
  supply: Num;
  borrows: Num;
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
   * @param k The cache account's public key.
   */
  static async load(program: Program<Zo>, k: PublicKey, st: StateSchema) {
    return new this(program, k, await Cache.fetch(program, k, st), st);
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

  private static async fetch(
    program: Program<Zo>,
    k: PublicKey,
    st: StateSchema,
  ): Promise<Schema> {
    const data = (await program.account["cache"].fetch(k)) as CacheSchema;
    return {
      ...data,
      oracles: data.oracles
        .filter((c) => !c.symbol.data.every((x) => x === 0))
        .map((c, i) => {
          const decimals = c.baseDecimals - c.quoteDecimals;
          return {
            ...c,
            symbol: loadSymbol(c.symbol),
            price: Num.fromWI80F48(c.price, decimals),
            twap: Num.fromWI80F48(c.twap, decimals),
          };
        }),
      marks: st.perpMarkets.map((m, i) => {
        const decimals = m.assetDecimals;
        const c = data.marks[i]!;
        return {
          ...c,
          price: Num.fromWI80F48(c.price, decimals),
          twap: c.twap.map((x) => ({
            ...x,
            startTime: new Date(x.startTime.toNumber()),
            open: Num.fromWI80F48(x.open, decimals),
            low: Num.fromWI80F48(x.low, decimals),
            high: Num.fromWI80F48(x.high, decimals),
            close: Num.fromWI80F48(x.close, decimals),
          })),
        };
      }),
      borrowCache: st.collaterals.map((col, i) => {
        const decimals = col.decimals;
        const c = data.borrowCache[i]!;
        return {
          ...c,
          supply: Num.fromWI80F48(c.supply, decimals),
          borrows: Num.fromWI80F48(c.borrows, decimals),
          supplyMultiplier: loadWI80F48(c.supplyMultiplier),
          borrowMultiplier: loadWI80F48(c.borrowMultiplier),
        };
      }),
    };
  }
}
