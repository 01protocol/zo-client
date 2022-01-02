"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const decimal_js_1 = __importDefault(require("decimal.js"));
const utils_1 = require("./utils");
class Num {
    constructor(n, decimals) {
        this.decimals = decimals;
        this.precisionDecimals = 0;
        this._float = null;
        this._dec = null;
        if (!Number.isInteger(decimals)) {
            throw TypeError(`Invalid number of decimals ${decimals}`);
        }
        if (bn_js_1.default.isBN(n)) {
            this.n = n;
        }
        else if (n instanceof decimal_js_1.default) {
            this.n = new bn_js_1.default(n.times(new decimal_js_1.default(10).toPower(decimals)).round().toString());
        }
        else {
            this.n = new bn_js_1.default(n * Math.pow(10, decimals));
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
            this._dec = new decimal_js_1.default(this.toString());
        }
        return this._dec;
    }
    get decimal() {
        return new decimal_js_1.default(this.toString()).div(new decimal_js_1.default(10).toPower(this.precisionDecimals));
    }
    get number() {
        return Number.parseFloat(this.decimal.toString());
    }
    /** Returns the number in smol Decimal (i.e. smallest units). */
    get smolDecimal() {
        return new decimal_js_1.default(this.toString()).div(new decimal_js_1.default(10).toPower(this.precisionDecimals - this.decimals));
    }
    static fromWI80F48(data, decimals) {
        const decimal = (0, utils_1.loadWI80F48)(data);
        const precisionDecimals = decimal.decimalPlaces();
        const ogDecimal = new bn_js_1.default(decimal.toString().replace(".", ""));
        const num = new Num(ogDecimal, decimals);
        num.precisionDecimals = precisionDecimals;
        return num;
    }
    toString() {
        return new decimal_js_1.default(this.n.toString())
            .div(new decimal_js_1.default(10).toPower(this.decimals))
            .toString();
    }
}
exports.default = Num;
