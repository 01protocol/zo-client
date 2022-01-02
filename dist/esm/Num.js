import BN from "bn.js";
import Decimal from "decimal.js";
import { loadWI80F48 } from "./utils";
export default class Num {
    constructor(n, decimals) {
        this.decimals = decimals;
        this.precisionDecimals = 0;
        this._float = null;
        this._dec = null;
        if (!Number.isInteger(decimals)) {
            throw TypeError(`Invalid number of decimals ${decimals}`);
        }
        if (BN.isBN(n)) {
            this.n = n;
        }
        else if (n instanceof Decimal) {
            this.n = new BN(n.times(new Decimal(10).toPower(decimals)).round().toString());
        }
        else {
            this.n = new BN(n * Math.pow(10, decimals));
        }
    }
    get float() {
        if (!this._float) {
            this._float = Number.parseFloat(this.toString());
        }
        return this._float;
    }
    get dec() {
        if (!this._dec) {
            this._dec = new Decimal(this.toString());
        }
        return this._dec;
    }
    get decimal() {
        return new Decimal(this.toString()).div(new Decimal(10).toPower(this.precisionDecimals));
    }
    get number() {
        return Number.parseFloat(this.decimal.toString());
    }
    /** Returns the number in smol Decimal (i.e. smallest units). */
    get smolDecimal() {
        return new Decimal(this.toString()).div(new Decimal(10).toPower(this.precisionDecimals - this.decimals));
    }
    static fromWI80F48(data, decimals) {
        const decimal = loadWI80F48(data);
        const precisionDecimals = decimal.decimalPlaces();
        const ogDecimal = new BN(decimal.toString().replace(".", ""));
        const num = new Num(ogDecimal, decimals);
        num.precisionDecimals = precisionDecimals;
        return num;
    }
    toString() {
        return new Decimal(this.n.toString())
            .div(new Decimal(10).toPower(this.decimals))
            .toString();
    }
}
