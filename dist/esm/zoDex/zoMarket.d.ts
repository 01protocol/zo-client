/// <reference types="node" />
import { Slab } from "./slab";
import BN from "bn.js";
import { AccountInfo, Commitment, Connection, PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";
import { TransactionId } from "../types";
import { Program } from "@project-serum/anchor";
import { State } from "../index";
export declare const MARKET_STATE_LAYOUT_V3: any;
export declare class ZoMarket {
    private readonly _decoded;
    private readonly _baseSplTokenDecimals;
    private readonly _quoteSplTokenDecimals;
    private readonly _skipPreflight;
    private readonly _commitment;
    private readonly _programId;
    private readonly _openOrdersAccountsCache;
    private _layoutOverride?;
    private readonly _feeDiscountKeysCache;
    constructor(decoded: any, baseMintDecimals: number, quoteMintDecimals: number, options: MarketOptions | undefined, programId: PublicKey, layoutOverride?: any);
    get eventQueueAddress(): PublicKey;
    get requestQueueAddress(): PublicKey;
    get programId(): PublicKey;
    get address(): PublicKey;
    get publicKey(): PublicKey;
    get baseMintAddress(): PublicKey;
    get quoteMintAddress(): PublicKey;
    get bidsAddress(): PublicKey;
    get asksAddress(): PublicKey;
    get decoded(): any;
    get minOrderSize(): number;
    get tickSize(): number;
    private get _baseSplTokenMultiplier();
    private get _quoteSplTokenMultiplier();
    static getLayout(_programId: PublicKey): any;
    static findAccountsByMints(connection: Connection, baseMintAddress: PublicKey, quoteMintAddress: PublicKey, programId: PublicKey): Promise<{
        publicKey: PublicKey;
        accountInfo: AccountInfo<Buffer>;
    }[]>;
    static load(connection: Connection, address: PublicKey, options?: MarketOptions, programId?: PublicKey, accountInfoPrefetched?: AccountInfo<Buffer>, layoutOverride?: any): Promise<ZoMarket>;
    loadBids(connection: Connection): Promise<Orderbook>;
    loadAsks(connection: Connection): Promise<Orderbook>;
    loadOrdersForOwner(connection: Connection, controlAddress: PublicKey, cacheDurationMs?: number): Promise<Order[]>;
    filterForOpenOrders(bids: Orderbook, asks: Orderbook, controlAccount: PublicKey): Order[];
    findBaseTokenAccountsForOwner(connection: Connection, ownerAddress: PublicKey, includeUnwrappedSol?: boolean): Promise<Array<{
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }>>;
    getTokenAccountsByOwnerForMint(connection: Connection, ownerAddress: PublicKey, mintAddress: PublicKey): Promise<Array<{
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }>>;
    findQuoteTokenAccountsForOwner(connection: Connection, ownerAddress: PublicKey, includeUnwrappedSol?: boolean): Promise<{
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
    }[]>;
    findOpenOrdersAccountsForOwner(connection: Connection, ownerAddress: PublicKey, cacheDurationMs?: number): Promise<ZoOpenOrders[]>;
    getSplTokenBalanceFromAccountInfo(accountInfo: AccountInfo<Buffer>, decimals: number): number;
    loadRequestQueue(connection: Connection): Promise<any[]>;
    loadEventQueue(connection: Connection): Promise<import("./queue").Event[]>;
    loadFills(connection: Connection, limit?: number): Promise<any[]>;
    parseFillEvent(event: any): any;
    priceLotsToNumber(price: BN): number;
    priceNumberToLots(price: number): BN;
    baseSplSizeToNumber(size: BN): number;
    quoteSplSizeToNumber(size: BN): number;
    baseSizeLotsToNumber(size: BN): number;
    baseSizeNumberToLots(size: number): BN;
    quoteSizeLotsToNumber(size: BN): number;
    quoteSizeNumberToLots(size: number): BN;
    quoteSizeNumberToSmoll(size: number): BN;
    consumeEvents(program: Program, st: State, controlAccs: PublicKey[], // make sure the indexes match
    openOrdersAccs: PublicKey[]): Promise<TransactionId>;
    crankPnl(program: Program, st: State, controlAccs: PublicKey[], openOrdersAccs: PublicKey[], marginAccs: PublicKey[]): Promise<TransactionId>;
}
export interface MarketOptions {
    skipPreflight?: boolean;
    commitment?: Commitment;
}
export declare const _OPEN_ORDERS_LAYOUT_V2: any;
export declare class ZoOpenOrders {
    address: PublicKey;
    market: PublicKey;
    owner: PublicKey;
    baseTokenFree: BN;
    baseTokenTotal: BN;
    quoteTokenFree: BN;
    quoteTokenTotal: BN;
    referrerRebatesAccrued: BN;
    realizedPnl: BN;
    fundingIndex: BN;
    coinOnBids: BN;
    coinOnAsks: BN;
    orders: BN[];
    clientIds: BN[];
    private _programId;
    constructor(address: PublicKey, decoded: any, programId: PublicKey);
    get publicKey(): PublicKey;
    static getLayout(_programId: PublicKey): any;
    static findForOwner(connection: Connection, ownerAddress: PublicKey, programId: PublicKey): Promise<ZoOpenOrders[]>;
    static findForMarketAndOwner(connection: Connection, marketAddress: PublicKey, ownerAddress: PublicKey, programId: PublicKey): Promise<ZoOpenOrders[]>;
    static load(connection: Connection, address: PublicKey, programId: PublicKey): Promise<ZoOpenOrders>;
    static fromAccountInfo(address: PublicKey, accountInfo: AccountInfo<Buffer>, programId: PublicKey): ZoOpenOrders;
}
export declare const ORDERBOOK_LAYOUT: any;
export declare class Orderbook {
    market: ZoMarket;
    isBids: boolean;
    slab: Slab;
    constructor(market: ZoMarket, accountFlags: any, slab: Slab);
    static get LAYOUT(): any;
    static decode(market: ZoMarket, buffer: Buffer): Orderbook;
    getL2(depth: number): [number, number, BN, BN][];
    [Symbol.iterator](): Generator<Order, any, unknown>;
    items(descending?: boolean): Generator<Order>;
}
export interface Order {
    orderId: BN;
    controlAddress: PublicKey;
    openOrdersSlot: number;
    price: number;
    priceLots: BN;
    size: number;
    feeTier: number;
    sizeLots: BN;
    side: "buy" | "sell";
    clientId?: BN;
}
