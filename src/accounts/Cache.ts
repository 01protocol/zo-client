import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import BaseAccount from "./BaseAccount";
import { CacheSchema } from "../types";
import { loadWrappedI80F48 } from "../utils";

type OracleCache = Omit<CacheSchema["oracleCache"][0], "price" | "twap"> & {
  price: Decimal;
  twap: Decimal;
};

type MarkCache = Omit<CacheSchema["markCache"][0], "price" | "twap"> & {
  price: Decimal;
  twap: {
    startTime: Date;
    open: Decimal;
    low: Decimal;
    high: Decimal;
    close: Decimal;
  }[];
};

type Schema = Omit<CacheSchema, "oracleCache" | "markCache"> & {
  oracleCache: OracleCache[];
  markCache: MarkCache[];
};

export default class Cache extends BaseAccount<Schema, "cache"> {
  static processData(data: CacheSchema): Schema {
    return {
      ...data,
      oracleCache: data.oracleCache
        .filter((c) => !c.key.equals(PublicKey.default))
        .map((c) => ({
          ...c,
          price: loadWrappedI80F48(c.price),
          twap: loadWrappedI80F48(c.twap),
        })),
      markCache: data.markCache
        .filter((c) => !c.lastUpdated.isZero())
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
    };
  }

  async refresh(): Promise<void> {
    this.data = Cache.processData(
      (await this.accountClient.fetch(this.pubkey)) as CacheSchema,
    );
  }

  static async load(k: PublicKey) {
    return new this(
      k,
      "cache",
      this.processData(
        (await this.program.account["cache"].fetch(k)) as CacheSchema,
      ),
    );
  }
}
