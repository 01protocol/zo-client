import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import Decimal from "decimal.js";
import { loadWI80F48 } from "./utils";

export default class Num {
  public readonly n: Readonly<BN>;
  private precisionDecimals = 0;

  static fromWI80F48(
    data: { data: BN },
    decimals: number,
    mint: Readonly<PublicKey> | null = null,
  ) {
    const decimal = loadWI80F48(data);
    const precisionDecimals = decimal.decimalPlaces();
    const ogDecimal = new BN(decimal.toString().replace(".", ""));
    const num = new Num(ogDecimal, decimals, mint);
    num.precisionDecimals = precisionDecimals;
    return num;
  }

  public constructor(
    n: BN | Decimal | number,
    public readonly decimals: number,
    public readonly mint: Readonly<PublicKey> | null = null,
  ) {
    if (!Number.isInteger(decimals)) {
      throw TypeError(`Invalid number of decimals ${decimals}`);
    }
    if (BN.isBN(n)) {
      this.n = n;
    } else if (n instanceof Decimal) {
      this.n = new BN(
        n.times(new Decimal(10).toPower(decimals)).round().toString(),
      );
    } else {
      this.n = new BN(n * Math.pow(10, decimals));
    }
  }

  public toString(precision: number = this.decimals): string {
    const s = this.n.toString();
    const i = s.length - this.decimals;
    const l = Math.max(0, i + precision - s.length);
    return precision === 0
      ? s.slice(0, i)
      : `${s.slice(0, i)}.${s.slice(i, i + precision)}${"0".repeat(l)}`;
  }

  _float: number | null = null;
  get float(): number {
    if (!this._float) {
      this._float = Number.parseFloat(this.toString());
    }
    return this._float;
  }

  _dec: Decimal | null = null;
  get dec(): Decimal {
    if (!this._dec) {
      this._dec = new Decimal(this.toString());
    }
    return this._dec;
  }

  get decimal(): Decimal {
    return new Decimal(this.toString()).div(
      new Decimal(10).toPower(this.precisionDecimals),
    );
  }

  get number(): number {
    return Number.parseFloat(this.decimal.toString());
  }
}
