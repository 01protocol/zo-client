"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@project-serum/anchor");
const BaseAccount_1 = __importDefault(require("./BaseAccount"));
const Num_1 = __importDefault(require("../Num"));
const utils_1 = require("../utils");
/**
 * The Cache account stores and tracks oracle prices, mark prices, funding and borrow lending multipliers.
 */
class Cache extends BaseAccount_1.default {
    constructor(program, k, data, _st) {
        super(program, k, data);
        this._st = _st;
    }
    /**
     * Loads a new Cache object from its public key.
     * @param k The cache account's public key.
     */
    static load(program, k, st) {
        return __awaiter(this, void 0, void 0, function* () {
            return new this(program, k, yield Cache.fetch(program, k, st), st);
        });
    }
    static fetch(program, k, st) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield program.account["cache"].fetch(k, "confirmed"));
            return Object.assign(Object.assign({}, data), { oracles: data.oracles
                    .filter((c) => !c.symbol.data.every((x) => x === 0))
                    .map((c) => {
                    const decimals = c.quoteDecimals - c.baseDecimals;
                    return Object.assign(Object.assign({}, c), { symbol: (0, utils_1.loadSymbol)(c.symbol), price: Num_1.default.fromWI80F48(c.price, decimals), twap: Num_1.default.fromWI80F48(c.twap, decimals) });
                }), marks: st.perpMarkets.map((m, i) => {
                    const decimals = m.assetDecimals;
                    const c = data.marks[i];
                    return Object.assign(Object.assign({}, c), { price: Num_1.default.fromWI80F48(c.price, decimals - 6), twap: {
                            cumulAvg: Num_1.default.fromWI80F48(c.twap.cumulAvg, decimals - 6),
                            open: Num_1.default.fromWI80F48(c.twap.open, decimals - 6),
                            high: Num_1.default.fromWI80F48(c.twap.high, decimals - 6),
                            low: Num_1.default.fromWI80F48(c.twap.low, decimals - 6),
                            close: Num_1.default.fromWI80F48(c.twap.close, decimals - 6),
                            lastSampleStartTime: new Date(c.twap.lastSampleStartTime.toNumber()),
                        } });
                }), borrowCache: st.collaterals.map((col, i) => {
                    const decimals = col.decimals;
                    const c = data.borrowCache[i];
                    const rawSupply = (0, utils_1.loadWI80F48)(c.supply);
                    const rawBorrows = (0, utils_1.loadWI80F48)(c.borrows);
                    const supplyMultiplier = (0, utils_1.loadWI80F48)(c.supplyMultiplier);
                    const borrowMultiplier = (0, utils_1.loadWI80F48)(c.borrowMultiplier);
                    return Object.assign(Object.assign({}, c), { rawSupply, actualSupply: new Num_1.default(new anchor_1.BN(rawSupply.times(supplyMultiplier).floor().toString()), decimals), rawBorrows, actualBorrows: new Num_1.default(new anchor_1.BN(rawBorrows.times(borrowMultiplier).ceil().toString()), decimals), supplyMultiplier,
                        borrowMultiplier });
                }) });
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this.data = yield Cache.fetch(this.program, this.pubkey, this._st);
        });
    }
    /**
     * @param sym The collateral symbol. Ex: ("BTC")
     * @returns The oracle cache for the given collateral.
     */
    getOracleBySymbol(sym) {
        const i = this.data.oracles.findIndex((x) => x.symbol === sym);
        if (i < 0) {
            throw RangeError(`Invalid symbol ${sym} for <Cache ${this.pubkey.toBase58()}>`);
        }
        return this.data.oracles[i];
    }
}
exports.default = Cache;
