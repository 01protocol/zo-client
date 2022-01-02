"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseNumberToLots = exports.baseNumberToSmol = exports.priceNumberToLots = exports.priceNumberToSmolPrice = void 0;
const anchor_1 = require("@project-serum/anchor");
// price number is bigUSD / bigAsset
// smol price is smolUSD / smolAsset
function priceNumberToSmolPrice(price, baseDecimals, quoteDecimals) {
    return (price * Math.pow(10, quoteDecimals)) / Math.pow(10, baseDecimals);
}
exports.priceNumberToSmolPrice = priceNumberToSmolPrice;
// price number is bigUSD / bigAsset
// lots is USD lots / Asset lots
function priceNumberToLots(price, baseDecimals, baseLotSize, quoteDecimals, quoteLotSize) {
    return new anchor_1.BN(Math.round((price * Math.pow(10, quoteDecimals) * baseLotSize.toNumber()) /
        (Math.pow(10, baseDecimals) * quoteLotSize.toNumber())));
}
exports.priceNumberToLots = priceNumberToLots;
// base number is bigAsset
// smol is smolAsset
function baseNumberToSmol(size, baseDecimals) {
    return Math.round(size * Math.pow(10, baseDecimals));
}
exports.baseNumberToSmol = baseNumberToSmol;
// base number is bigAsset
// lots is Asset lots
function baseNumberToLots(size, baseDecimals, baseLotSize) {
    const native = new anchor_1.BN(Math.round(size * Math.pow(10, baseDecimals)));
    // rounds down to the nearest lot size
    return native.div(baseLotSize);
}
exports.baseNumberToLots = baseNumberToLots;
