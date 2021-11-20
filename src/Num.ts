import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
<<<<<<< HEAD
import Decimal from 'decimal.js'
=======
import Decimal from "decimal.js";
>>>>>>> 6dd9ee265b156ed5dff13f85dada16d4c8a75984

export default class Num {
  public readonly n: Readonly<BN>;

  public constructor(
    n: BN | Decimal | number,
    public readonly decimals: number,
    public readonly mint: Readonly<PublicKey> | null,
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

<<<<<<< HEAD
  get number(): number {
    return Number.parseFloat(this.toString());
=======
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
>>>>>>> 6dd9ee265b156ed5dff13f85dada16d4c8a75984
  }

  get decimal(): Decimal {
    return new Decimal(this.number);
  }
}
