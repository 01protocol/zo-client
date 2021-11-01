import BN from "bn.js";

export default class Num {
  public readonly n: Readonly<BN>;

  public constructor(
    n: Readonly<BN> | number,
    public readonly decimals: number,
  ) {
    if (!Number.isInteger(decimals)) {
      throw TypeError(`Invalid number of decimals ${decimals}`);
    }
    if (BN.isBN(n)) {
      this.n = n;
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

  public toNumber(): number {
    return Number.parseFloat(this.toString());
  }
}
