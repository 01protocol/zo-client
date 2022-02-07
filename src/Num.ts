import BN from "bn.js";
import Decimal from "decimal.js";
import { loadWI80F48 } from "./utils";

export default class Num {
  public n: Readonly<BN>;
  private precisionDecimals = 0;

  public constructor(n: BN | Decimal | number, public decimals: number) {
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

  /** Returns the number in smol Decimal (i.e. smallest units). */
  get smolDecimal(): Decimal {
    return new Decimal(this.toString()).div(
      new Decimal(10).toPower(this.precisionDecimals - this.decimals),
    );
  }

  static fromWI80F48(data: { data: BN }, decimals: number) {
    const decimal = loadWI80F48(data);
    const precisionDecimals = decimal.decimalPlaces();
    const ogDecimal = new BN(decimal.toString().replace(".", ""));
    const num = new Num(ogDecimal, decimals);
    num.precisionDecimals = precisionDecimals;
    return num;
  }

  public toString(): string {
    return new Decimal(this.n.toString())
      .div(new Decimal(10).toPower(this.decimals))
      .toString();
  }

  public clone() {
    const num = new Num(this.n, this.decimals);
    num.precisionDecimals = this.precisionDecimals;
    return num;
  }

  public raiseToPower(power: number) {
    const num = this.clone();
    num.n = num.n.pow(new BN(power));
    num.precisionDecimals *= power;
    num.decimals *= power;
    return num;
  }

  public div(m: number) {
    const num = this.clone();
    num.n = num.n.div(new BN(m));
    return num;
  }

  public mul(m: number) {
    const num = this.clone();
    num.n = num.n.mul(new BN(m));
    return num;
  }

  public divN(m: BN) {
    const num = this.clone();
    num.n = num.n.div(m);
    return num;
  }

  public mulN(m: BN) {
    const num = this.clone();
    num.n = num.n.mul(m);
    return num;
  }
}
