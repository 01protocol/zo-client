/// <reference types="bn.js" />
import { BN } from "@project-serum/anchor";
export declare function priceNumberToSmolPrice(price: number, baseDecimals: number, quoteDecimals: number): number;
export declare function priceNumberToLots(price: number, baseDecimals: number, baseLotSize: BN, quoteDecimals: number, quoteLotSize: BN): BN;
export declare function baseNumberToSmol(size: number, baseDecimals: number): number;
export declare function baseNumberToLots(size: number, baseDecimals: number, baseLotSize: BN): BN;
