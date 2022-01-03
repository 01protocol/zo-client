var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { blob, seq, struct } from "buffer-layout";
import { accountFlagsLayout, i128, i64, publicKeyLayout, u128, u64, } from "./layout";
import { SLAB_LAYOUT } from "./slab";
import BN from "bn.js";
import { PublicKey, } from "@solana/web3.js";
import { decodeEventQueue, decodeRequestQueue } from "./queue";
import { Buffer } from "buffer";
import { throwIfNull } from "../utils";
import { WRAPPED_SOL_MINT, ZERO_ONE_PROGRAM_ID, ZO_DEX_PROGRAM_ID, } from "../config";
import { State } from "../index";
export const MARKET_STATE_LAYOUT_V3 = struct([
    blob(5),
    accountFlagsLayout("accountFlags"),
    publicKeyLayout("ownAddress"),
    u64("quoteFeesAccrued"),
    publicKeyLayout("requestQueue"),
    publicKeyLayout("eventQueue"),
    publicKeyLayout("bids"),
    publicKeyLayout("asks"),
    u64("baseLotSize"),
    u64("quoteLotSize"),
    u64("feeRateBps"),
    u64("referrerRebatesAccrued"),
    i128("fundingIndex"),
    u64("lastUpdated"),
    u64("strike"),
    u64("perpType"),
    u64("coinDecimals"),
    u64("openInterest"),
    publicKeyLayout("authority"),
    publicKeyLayout("pruneAuthority"),
    blob(976),
    blob(7),
]);
export class ZoMarket {
    constructor(decoded, baseMintDecimals, quoteMintDecimals, options = {}, programId, layoutOverride) {
        const { skipPreflight = false, commitment = "recent" } = options;
        if (!decoded.accountFlags.initialized || !decoded.accountFlags.market) {
            throw new Error("Invalid market state");
        }
        this._decoded = decoded;
        this._baseSplTokenDecimals = baseMintDecimals;
        this._quoteSplTokenDecimals = quoteMintDecimals;
        this._skipPreflight = skipPreflight;
        this._commitment = commitment;
        this._programId = programId;
        this._openOrdersAccountsCache = {};
        this._feeDiscountKeysCache = {};
        this._layoutOverride = layoutOverride;
    }
    get eventQueueAddress() {
        return this._decoded.eventQueue;
    }
    get requestQueueAddress() {
        return this._decoded.requestQueue;
    }
    get programId() {
        return this._programId;
    }
    get address() {
        return this._decoded.ownAddress;
    }
    get publicKey() {
        return this.address;
    }
    get baseMintAddress() {
        return this._decoded.baseMint;
    }
    get quoteMintAddress() {
        return this._decoded.quoteMint;
    }
    get bidsAddress() {
        return this._decoded.bids;
    }
    get asksAddress() {
        return this._decoded.asks;
    }
    get decoded() {
        return this._decoded;
    }
    get minOrderSize() {
        return this.baseSizeLotsToNumber(new BN(1));
    }
    get tickSize() {
        return this.priceLotsToNumber(new BN(1));
    }
    get _baseSplTokenMultiplier() {
        return new BN(10).pow(new BN(this._baseSplTokenDecimals));
    }
    get _quoteSplTokenMultiplier() {
        return new BN(10).pow(new BN(this._quoteSplTokenDecimals));
    }
    static getLayout(_programId) {
        return MARKET_STATE_LAYOUT_V3;
    }
    static findAccountsByMints(connection, baseMintAddress, quoteMintAddress, programId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = [
                {
                    memcmp: {
                        offset: this.getLayout(programId).offsetOf("baseMint"),
                        bytes: baseMintAddress.toBase58(),
                    },
                },
                {
                    memcmp: {
                        offset: ZoMarket.getLayout(programId).offsetOf("quoteMint"),
                        bytes: quoteMintAddress.toBase58(),
                    },
                },
            ];
            return getFilteredProgramAccounts(connection, programId, filters);
        });
    }
    static load(connection, address, options = {}, programId = ZO_DEX_PROGRAM_ID, accountInfoPrefetched, layoutOverride) {
        return __awaiter(this, void 0, void 0, function* () {
            const { commitment = "confirmed" } = options;
            const { owner, data } = throwIfNull(accountInfoPrefetched
                ? accountInfoPrefetched
                : yield connection.getAccountInfo(address, commitment), "Market not found");
            if (!owner.equals(programId)) {
                throw new Error("Address not owned by program: " + owner.toBase58());
            }
            const decoded = (layoutOverride !== null && layoutOverride !== void 0 ? layoutOverride : this.getLayout(programId)).decode(data);
            if (!decoded.accountFlags.initialized ||
                !decoded.accountFlags.market ||
                !decoded.ownAddress.equals(address)) {
                throw new Error("Invalid market");
            }
            return new ZoMarket(decoded, decoded.coinDecimals, 6, options, programId, layoutOverride);
        });
    }
    loadBids(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.bids));
            return Orderbook.decode(this, data);
        });
    }
    loadAsks(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.asks));
            return Orderbook.decode(this, data);
        });
    }
    loadOrdersForOwner(connection, controlAddress, cacheDurationMs = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const [bids, asks] = yield Promise.all([
                this.loadBids(connection),
                this.loadAsks(connection),
            ]);
            return this.filterForOpenOrders(bids, asks, controlAddress);
        });
    }
    filterForOpenOrders(bids, asks, controlAccount) {
        return [...bids, ...asks].filter((order) => {
            return order.controlAddress.equals(controlAccount);
        });
    }
    findBaseTokenAccountsForOwner(connection, ownerAddress, includeUnwrappedSol = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.baseMintAddress.equals(WRAPPED_SOL_MINT) && includeUnwrappedSol) {
                const [wrapped, unwrapped] = yield Promise.all([
                    this.findBaseTokenAccountsForOwner(connection, ownerAddress, false),
                    connection.getAccountInfo(ownerAddress),
                ]);
                if (unwrapped !== null) {
                    return [{ pubkey: ownerAddress, account: unwrapped }, ...wrapped];
                }
                return wrapped;
            }
            return yield this.getTokenAccountsByOwnerForMint(connection, ownerAddress, this.baseMintAddress);
        });
    }
    // get supportsSrmFeeDiscounts() {
    //   return supportsSrmFeeDiscounts(this._programId);
    // }
    //
    // async findFeeDiscountKeys(
    //   connection: Connection,
    //   ownerAddress: PublicKey,
    //   cacheDurationMs = 0,
    // ): Promise<
    //   Array<{
    //     pubkey: PublicKey;
    //     feeTier: number;
    //     balance: number;
    //     mint: PublicKey;
    //   }>
    // > {
    //   let sortedAccounts: Array<{
    //     balance: number;
    //     mint: PublicKey;
    //     pubkey: PublicKey;
    //     feeTier: number;
    //   }> = [];
    //   const now = new Date().getTime();
    //   const strOwner = ownerAddress.toBase58();
    //   if (
    //     strOwner in this._feeDiscountKeysCache &&
    //     now - this._feeDiscountKeysCache[strOwner]!.ts < cacheDurationMs
    //   ) {
    //     return this._feeDiscountKeysCache[strOwner]!.accounts;
    //   }
    //
    //   if (this.supportsSrmFeeDiscounts) {
    //     // Fee discounts based on (M)SRM holdings supported in newer versions
    //     const msrmAccounts = (
    //       await this.getTokenAccountsByOwnerForMint(
    //         connection,
    //         ownerAddress,
    //         MSRM_MINT,
    //       )
    //     ).map(({ pubkey, account }) => {
    //       const balance = this.getSplTokenBalanceFromAccountInfo(
    //         account,
    //         MSRM_DECIMALS,
    //       );
    //       return {
    //         pubkey,
    //         mint: MSRM_MINT,
    //         balance,
    //         feeTier: getFeeTier(balance, 0),
    //       };
    //     });
    //     const srmAccounts = (
    //       await this.getTokenAccountsByOwnerForMint(
    //         connection,
    //         ownerAddress,
    //         SRM_MINT,
    //       )
    //     ).map(({ pubkey, account }) => {
    //       const balance = this.getSplTokenBalanceFromAccountInfo(
    //         account,
    //         SRM_DECIMALS,
    //       );
    //       return {
    //         pubkey,
    //         mint: SRM_MINT,
    //         balance,
    //         feeTier: getFeeTier(0, balance),
    //       };
    //     });
    //     sortedAccounts = msrmAccounts.concat(srmAccounts).sort((a, b) => {
    //       if (a.feeTier > b.feeTier) {
    //         return -1;
    //       } else if (a.feeTier < b.feeTier) {
    //         return 1;
    //       } else {
    //         if (a.balance > b.balance) {
    //           return -1;
    //         } else if (a.balance < b.balance) {
    //           return 1;
    //         } else {
    //           return 0;
    //         }
    //       }
    //     });
    //   }
    //   this._feeDiscountKeysCache[strOwner] = {
    //     accounts: sortedAccounts,
    //     ts: now,
    //   };
    //   return sortedAccounts;
    // }
    //
    // async findBestFeeDiscountKey(
    //   connection: Connection,
    //   ownerAddress: PublicKey,
    //   cacheDurationMs = 30000,
    // ): Promise<{ pubkey: PublicKey | null; feeTier: number }> {
    //   const accounts = await this.findFeeDiscountKeys(
    //     connection,
    //     ownerAddress,
    //     cacheDurationMs,
    //   );
    //   if (accounts.length > 0) {
    //     return {
    //       pubkey: accounts[0]!.pubkey,
    //       feeTier: accounts[0]!.feeTier,
    //     };
    //   }
    //   return {
    //     pubkey: null,
    //     feeTier: 0,
    //   };
    // }
    getTokenAccountsByOwnerForMint(connection, ownerAddress, mintAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield connection.getTokenAccountsByOwner(ownerAddress, {
                mint: mintAddress,
            })).value;
        });
    }
    findQuoteTokenAccountsForOwner(connection, ownerAddress, includeUnwrappedSol = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.quoteMintAddress.equals(WRAPPED_SOL_MINT) && includeUnwrappedSol) {
                const [wrapped, unwrapped] = yield Promise.all([
                    this.findQuoteTokenAccountsForOwner(connection, ownerAddress, false),
                    connection.getAccountInfo(ownerAddress),
                ]);
                if (unwrapped !== null) {
                    return [{ pubkey: ownerAddress, account: unwrapped }, ...wrapped];
                }
                return wrapped;
            }
            return yield this.getTokenAccountsByOwnerForMint(connection, ownerAddress, this.quoteMintAddress);
        });
    }
    findOpenOrdersAccountsForOwner(connection, ownerAddress, cacheDurationMs = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const strOwner = ownerAddress.toBase58();
            const now = new Date().getTime();
            if (strOwner in this._openOrdersAccountsCache &&
                now - this._openOrdersAccountsCache[strOwner].ts < cacheDurationMs) {
                return this._openOrdersAccountsCache[strOwner].accounts;
            }
            const openOrdersAccountsForOwner = yield ZoOpenOrders.findForMarketAndOwner(connection, this.address, ownerAddress, this._programId);
            this._openOrdersAccountsCache[strOwner] = {
                accounts: openOrdersAccountsForOwner,
                ts: now,
            };
            return openOrdersAccountsForOwner;
        });
    }
    getSplTokenBalanceFromAccountInfo(accountInfo, decimals) {
        return divideBnToNumber(new BN(accountInfo.data.slice(64, 72), 10, "le"), new BN(10).pow(new BN(decimals)));
    }
    loadRequestQueue(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.requestQueue));
            return decodeRequestQueue(data);
        });
    }
    loadEventQueue(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.eventQueue));
            return decodeEventQueue(data);
        });
    }
    loadFills(connection, limit = 100) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: once there's a separate source of fills use that instead
            const { data } = throwIfNull(yield connection.getAccountInfo(this._decoded.eventQueue));
            const events = decodeEventQueue(data, limit);
            return events
                .filter((event) => event.eventFlags.fill && event.nativeQuantityPaid.gtn(0))
                .map(this.parseFillEvent.bind(this));
        });
    }
    parseFillEvent(event) {
        let size, price, side, priceBeforeFees;
        if (event.eventFlags.bid) {
            side = "buy";
            priceBeforeFees = event.eventFlags.maker
                ? event.nativeQuantityPaid.add(event.nativeFeeOrRebate)
                : event.nativeQuantityPaid.sub(event.nativeFeeOrRebate);
            price = divideBnToNumber(priceBeforeFees.mul(this._baseSplTokenMultiplier), this._quoteSplTokenMultiplier.mul(event.nativeQuantityReleased));
            size = divideBnToNumber(event.nativeQuantityReleased, this._baseSplTokenMultiplier);
        }
        else {
            side = "sell";
            priceBeforeFees = event.eventFlags.maker
                ? event.nativeQuantityReleased.sub(event.nativeFeeOrRebate)
                : event.nativeQuantityReleased.add(event.nativeFeeOrRebate);
            price = divideBnToNumber(priceBeforeFees.mul(this._baseSplTokenMultiplier), this._quoteSplTokenMultiplier.mul(event.nativeQuantityPaid));
            size = divideBnToNumber(event.nativeQuantityPaid, this._baseSplTokenMultiplier);
        }
        return Object.assign(Object.assign({}, event), { side,
            price, feeCost: this.quoteSplSizeToNumber(event.nativeFeeOrRebate) *
                (event.eventFlags.maker ? -1 : 1), size });
    }
    priceLotsToNumber(price) {
        return divideBnToNumber(price.mul(this._decoded.quoteLotSize).mul(this._baseSplTokenMultiplier), this._decoded.baseLotSize.mul(this._quoteSplTokenMultiplier));
    }
    priceNumberToLots(price) {
        return new BN(Math.round((price *
            Math.pow(10, this._quoteSplTokenDecimals) *
            this._decoded.baseLotSize.toNumber()) /
            (Math.pow(10, this._baseSplTokenDecimals) *
                this._decoded.quoteLotSize.toNumber())));
    }
    baseSplSizeToNumber(size) {
        return divideBnToNumber(size, this._baseSplTokenMultiplier);
    }
    quoteSplSizeToNumber(size) {
        return divideBnToNumber(size, this._quoteSplTokenMultiplier);
    }
    baseSizeLotsToNumber(size) {
        return divideBnToNumber(size.mul(this._decoded.baseLotSize), this._baseSplTokenMultiplier);
    }
    baseSizeNumberToLots(size) {
        const native = new BN(Math.round(size * Math.pow(10, this._baseSplTokenDecimals)));
        // rounds down to the nearest lot size
        return native.div(this._decoded.baseLotSize);
    }
    quoteSizeLotsToNumber(size) {
        return divideBnToNumber(size.mul(this._decoded.quoteLotSize), this._quoteSplTokenMultiplier);
    }
    quoteSizeNumberToLots(size) {
        const native = new BN(Math.round(size * Math.pow(10, this._quoteSplTokenDecimals)));
        // rounds down to the nearest lot size
        return native.div(this._decoded.quoteLotSize);
    }
    quoteSizeNumberToSmoll(size) {
        const native = new BN(Math.round(size * Math.pow(10, this._quoteSplTokenDecimals)));
        // rounds down to the nearest lot size
        return native;
    }
    consumeEvents(program, st, controlAccs, // make sure the indexes match
    openOrdersAccs) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = 32;
            const eq = yield this.loadEventQueue(program.provider.connection);
            //console.log(eq);
            const signer = (yield State.getSigner(st.pubkey, ZERO_ONE_PROGRAM_ID))[0];
            return yield program.rpc.consumeEvents(limit, {
                accounts: {
                    state: st.pubkey,
                    stateSigner: signer,
                    dexProgram: ZO_DEX_PROGRAM_ID,
                    market: this.address,
                    eventQueue: this.eventQueueAddress,
                },
                remainingAccounts: doubleSort(controlAccs, openOrdersAccs),
            });
        });
    }
    // make sure account arrays have same order of user accounts
    crankPnl(program, st, controlAccs, openOrdersAccs, marginAccs) {
        return __awaiter(this, void 0, void 0, function* () {
            const ra = [];
            controlAccs.forEach((c, i) => {
                ra.push({ isSigner: false, isWritable: true, pubkey: c });
            });
            openOrdersAccs.forEach((c) => {
                ra.push({ isSigner: false, isWritable: true, pubkey: c });
            });
            marginAccs.forEach((c) => {
                ra.push({ isSigner: false, isWritable: true, pubkey: c });
            });
            const signer = (yield State.getSigner(st.pubkey, ZERO_ONE_PROGRAM_ID))[0];
            return yield program.rpc.crankPnl({
                accounts: {
                    state: st.pubkey,
                    stateSigner: signer,
                    cache: st.cache.pubkey,
                    dexProgram: ZO_DEX_PROGRAM_ID,
                    market: this.address,
                },
                remainingAccounts: ra,
            });
        });
    }
}
export const _OPEN_ORDERS_LAYOUT_V2 = struct([
    blob(5),
    accountFlagsLayout("accountFlags"),
    publicKeyLayout("market"),
    publicKeyLayout("owner"),
    // These are in spl-token (i.e. not lot) units
    i64("baseTokenFree"),
    i64("baseTokenTotal"),
    i64("quoteTokenFree"),
    i64("quoteTokenTotal"),
    u128("freeSlotBits"),
    u128("isBidBits"),
    seq(u128(), 128, "orders"),
    seq(u64(), 128, "clientIds"),
    u64("referrerRebatesAccrued"),
    i64("realizedPnl"),
    i128("fundingIndex"),
    u64("coinOnBids"),
    u64("coinOnAsks"),
    blob(7),
]);
export class ZoOpenOrders {
    constructor(address, decoded, programId) {
        this.address = address;
        this._programId = programId;
        Object.assign(this, decoded);
    }
    get publicKey() {
        return this.address;
    }
    static getLayout(_programId) {
        return _OPEN_ORDERS_LAYOUT_V2;
    }
    static findForOwner(connection, ownerAddress, programId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = [
                {
                    memcmp: {
                        offset: this.getLayout(programId).offsetOf("owner"),
                        bytes: ownerAddress.toBase58(),
                    },
                },
                {
                    dataSize: this.getLayout(programId).span,
                },
            ];
            const accounts = yield getFilteredProgramAccounts(connection, programId, filters);
            return accounts.map(({ publicKey, accountInfo }) => ZoOpenOrders.fromAccountInfo(publicKey, accountInfo, programId));
        });
    }
    static findForMarketAndOwner(connection, marketAddress, ownerAddress, programId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = [
                {
                    memcmp: {
                        offset: this.getLayout(programId).offsetOf("market"),
                        bytes: marketAddress.toBase58(),
                    },
                },
                {
                    memcmp: {
                        offset: this.getLayout(programId).offsetOf("owner"),
                        bytes: ownerAddress.toBase58(),
                    },
                },
                {
                    dataSize: this.getLayout(programId).span,
                },
            ];
            const accounts = yield getFilteredProgramAccounts(connection, programId, filters);
            return accounts.map(({ publicKey, accountInfo }) => ZoOpenOrders.fromAccountInfo(publicKey, accountInfo, programId));
        });
    }
    static load(connection, address, programId) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountInfo = yield connection.getAccountInfo(address);
            if (accountInfo === null) {
                throw new Error("Open orders account not found");
            }
            return ZoOpenOrders.fromAccountInfo(address, accountInfo, programId);
        });
    }
    static fromAccountInfo(address, accountInfo, programId) {
        const { owner, data } = accountInfo;
        if (!owner.equals(programId)) {
            throw new Error("Address not owned by program");
        }
        const decoded = this.getLayout(programId).decode(data);
        if (!decoded.accountFlags.initialized || !decoded.accountFlags.openOrders) {
            throw new Error("Invalid open orders account");
        }
        return new ZoOpenOrders(address, decoded, programId);
    }
}
export const ORDERBOOK_LAYOUT = struct([
    blob(5),
    accountFlagsLayout("accountFlags"),
    SLAB_LAYOUT.replicate("slab"),
    blob(7),
]);
export class Orderbook {
    constructor(market, accountFlags, slab) {
        if (!accountFlags.initialized || !(accountFlags.bids ^ accountFlags.asks)) {
            throw new Error("Invalid orderbook");
        }
        this.market = market;
        this.isBids = accountFlags.bids;
        this.slab = slab;
    }
    static get LAYOUT() {
        return ORDERBOOK_LAYOUT;
    }
    static decode(market, buffer) {
        const { accountFlags, slab } = ORDERBOOK_LAYOUT.decode(buffer);
        return new Orderbook(market, accountFlags, slab);
    }
    getL2(depth) {
        const descending = this.isBids;
        const levels = []; // (price, size)
        for (const { key, quantity } of this.slab.items(descending)) {
            const price = getPriceFromKey(key);
            if (levels.length > 0 && levels[levels.length - 1][0].eq(price)) {
                levels[levels.length - 1][1].iadd(quantity);
            }
            else if (levels.length === depth) {
                break;
            }
            else {
                levels.push([price, quantity]);
            }
        }
        return levels.map(([priceLots, sizeLots]) => [
            this.market.priceLotsToNumber(priceLots),
            this.market.baseSizeLotsToNumber(sizeLots),
            priceLots,
            sizeLots,
        ]);
    }
    [Symbol.iterator]() {
        return this.items(false);
    }
    *items(descending = false) {
        for (const { key, ownerSlot, control, quantity, feeTier, clientOrderId, } of this.slab.items(descending)) {
            const price = getPriceFromKey(key);
            yield {
                orderId: key,
                clientId: clientOrderId,
                controlAddress: control,
                openOrdersSlot: ownerSlot,
                feeTier,
                price: this.market.priceLotsToNumber(price),
                priceLots: price,
                size: this.market.baseSizeLotsToNumber(quantity),
                sizeLots: quantity,
                side: (this.isBids ? "buy" : "sell"),
            };
        }
    }
}
function getPriceFromKey(key) {
    return key.ushrn(64);
}
function divideBnToNumber(numerator, denominator) {
    const quotient = numerator.div(denominator).toNumber();
    const rem = numerator.umod(denominator);
    const gcd = rem.gcd(denominator);
    return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}
function getFilteredProgramAccounts(connection, programId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const resp = yield connection._rpcRequest("getProgramAccounts", [
            programId.toBase58(),
            {
                commitment: connection.commitment,
                filters,
                encoding: "base64",
            },
        ]);
        if (resp.error) {
            throw new Error(resp.error.message);
        }
        return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
            publicKey: new PublicKey(pubkey),
            accountInfo: {
                data: Buffer.from(data[0], "base64"),
                executable,
                owner: new PublicKey(owner),
                lamports,
            },
        }));
    });
}
function doubleSort(a, b) {
    const together = [];
    if (a.length !== b.length) {
        throw new Error("Arrays don't have same length");
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== undefined && b[i] !== undefined) {
            const slice = [a[i], b[i]];
            together.push(slice);
        }
    }
    together.sort((a, b) => {
        return a[0].toBuffer().swap64().compare(b[0].toBuffer().swap64());
    });
    const flattened = [];
    for (const pair of together) {
        flattened.push({ isSigner: false, isWritable: true, pubkey: pair[0] });
    }
    for (const pair of together) {
        flattened.push({ isSigner: false, isWritable: true, pubkey: pair[1] });
    }
    return flattened;
}
