import { BN } from "@project-serum/anchor";
// price number is bigUSD / bigAsset
// smol price is smolUSD / smolAsset
export function priceNumberToSmolPrice(price, baseDecimals, quoteDecimals) {
    return (price * Math.pow(10, quoteDecimals)) / Math.pow(10, baseDecimals);
}
// price number is bigUSD / bigAsset
// lots is USD lots / Asset lots
export function priceNumberToLots(price, baseDecimals, baseLotSize, quoteDecimals, quoteLotSize) {
    return new BN(Math.round((price * Math.pow(10, quoteDecimals) * baseLotSize.toNumber()) /
        (Math.pow(10, baseDecimals) * quoteLotSize.toNumber())));
}
// base number is bigAsset
// smol is smolAsset
export function baseNumberToSmol(size, baseDecimals) {
    return Math.round(size * Math.pow(10, baseDecimals));
}
// base number is bigAsset
// lots is Asset lots
export function baseNumberToLots(size, baseDecimals, baseLotSize) {
    const native = new BN(Math.round(size * Math.pow(10, baseDecimals)));
    // rounds down to the nearest lot size
    return native.div(baseLotSize);
}
