//future: could be optimized here and by a lot; also would be good to have addition etc here
//TODO:implement
import { BN } from "@project-serum/anchor";
import { Decimal } from "decimal.js";

enum InputType {
  Number,
  BN,
  Decimal,
}

export class TokenAccountBalance {
  private readonly _decimal: Decimal;
  private readonly _bn: BN;
  private readonly _number: number;
  private readonly _numDecimals: number;

  constructor(input: Decimal | number | BN, numDecimals: number) {
    const factor = new Decimal(10).pow(numDecimals);
    const type = TokenAccountBalance.getInputType(input);
    if (type === InputType.Decimal) {
      // @ts-ignore
      this._decimal = input;
      // @ts-ignore
      this._number = input.toNumber();
      // @ts-ignore
      this._bn = new BN(input.mul(factor).toNumber());
    } else if (type === InputType.BN) {
      // @ts-ignore
      this._bn = input;
      try {
        // @ts-ignore
        this._decimal = new Decimal(input.toNumber()).div(factor);
        this._number = this._decimal.toNumber();
      } catch (_) {
        this._decimal = new Decimal(0);
        this._number = 0;
      }
    } else {
      // @ts-ignore
      this._number = input;
      // @ts-ignore
      this._bn = new BN(input * Math.pow(10, numDecimals));
      // @ts-ignore
      this._decimal = new Decimal(input);
    }
    this._numDecimals = numDecimals;
  }

  get numDecimals() {
    return this._numDecimals;
  }

  get decimal(): Decimal {
    return this._decimal;
  }

  get bn(): BN {
    return this._bn;
  }

  get number(): number {
    return this._number;
  }

  private static getInputType(input: Decimal | number | BN) {
    let type = InputType.Number;
    // @ts-ignore
    if (typeof input !== "number") {
      try {
        // @ts-ignore
        new Decimal(input);
        type = InputType.Decimal;
      } catch (_) {}
      try {
        // @ts-ignore
        new BN(input);
        type = InputType.BN;
      } catch (_) {}
    }
    return type;
  }
}

export default TokenAccountBalance;
