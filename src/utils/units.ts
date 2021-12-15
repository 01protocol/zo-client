import { BN } from "@project-serum/anchor";

// price number is bigUSD / bigAsset
// smol price is smolUSD / smolAsset
export function priceNumberToSmolPrice(
  price: number,
  baseDecimals: number,
  quoteDecimals: number,
): number {
  return (price * Math.pow(10, quoteDecimals)) / Math.pow(10, baseDecimals);
}

// price number is bigUSD / bigAsset
// lots is USD lots / Asset lots
export function priceNumberToLots(
  price: number,
  baseDecimals: number,
  baseLotSize: BN,
  quoteDecimals: number,
  quoteLotSize: BN,
): BN {
  return new BN(
    Math.round(
      (price * Math.pow(10, quoteDecimals) * baseLotSize.toNumber()) /
        (Math.pow(10, baseDecimals) * quoteLotSize.toNumber()),
    ),
  );
}

// base number is bigAsset
// smol is smolAsset
export function baseNumberToSmol(size: number, baseDecimals: number): number {
  return Math.round(size * Math.pow(10, baseDecimals));
}

// base number is bigAsset
// lots is Asset lots
export function baseNumberToLots(
  size: number,
  baseDecimals: number,
  baseLotSize: BN,
): BN {
  const native = new BN(Math.round(size * Math.pow(10, baseDecimals)));
  // rounds down to the nearest lot size
  return native.div(baseLotSize);
}
