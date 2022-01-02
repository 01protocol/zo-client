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
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("../utils");
const BaseAccount_1 = __importDefault(require("./BaseAccount"));
const Cache_1 = __importDefault(require("./Cache"));
const zoMarket_1 = require("../zoDex/zoMarket");
const config_1 = require("../config");
/**
 * The state account defines program-level parameters, and tracks listed markets and supported collaterals.
 */
class State extends BaseAccount_1.default {
    constructor(program, pubkey, data, signer, cache) {
        super(program, pubkey, data);
        this.signer = signer;
        this.cache = cache;
        this._getMarketBySymbol = {};
    }
    /**
     * Gets the state signer's pda account and bump.
     * @returns An array consisting of the state signer pda and bump.
     */
    static getSigner(stateKey, programId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield web3_js_1.PublicKey.findProgramAddress([stateKey.toBuffer()], programId);
        });
    }
    /**
     * @param k The state's public key.
     */
    static load(program, k) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.fetch(program, k);
            const [signer, signerNonce] = yield this.getSigner(k, program.programId);
            if (signerNonce !== data.signerNonce) {
                throw Error("Invalid state signer nonce");
            }
            const cache = yield Cache_1.default.load(program, data.cache, data);
            return new this(program, k, data, signer, cache);
        });
    }
    static fetch(program, k) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield program.account["state"].fetch(k, "confirmed"));
            // Convert StateSchema to Schema.
            return Object.assign(Object.assign({}, data), { vaults: data.vaults.slice(0, data.totalCollaterals), collaterals: data.collaterals
                    .slice(0, data.totalCollaterals)
                    .map((x) => (Object.assign(Object.assign({}, x), { oracleSymbol: (0, utils_1.loadSymbol)(x.oracleSymbol) }))), perpMarkets: data.perpMarkets.slice(0, data.totalMarkets).map((x) => (Object.assign(Object.assign({}, x), { symbol: (0, utils_1.loadSymbol)(x.symbol), oracleSymbol: (0, utils_1.loadSymbol)(x.oracleSymbol) }))) });
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this._getMarketBySymbol = {};
            [this.data] = yield Promise.all([
                State.fetch(this.program, this.pubkey),
                this.cache.refresh(),
            ]);
        });
    }
    /**
     * Get the index of the collateral in the State's collaterals list using the mint public key.
     * @param mint The mint's public key.
     */
    getCollateralIndex(mint) {
        const i = this.data.collaterals.findIndex((x) => x.mint.equals(mint));
        if (i < 0) {
            throw RangeError(`Invalid mint ${mint.toBase58()} for <State ${this.pubkey.toBase58()}>`);
        }
        return i;
    }
    /**
     * Get the vault public key and the CollateralInfo object for a collateral using the mint public key.
     * @param mint The mint's public key.
     * @returns The vault public key and the CollateralInfo object.
     */
    getVaultCollateralByMint(mint) {
        const i = this.getCollateralIndex(mint);
        return [
            this.data.vaults[i],
            this.data.collaterals[i],
        ];
    }
    /**
     * Get the index of a market in the State's PerpMarkets list using the market symbol.
     * @param sym The market symbol. Ex:("BTC-PERP")
     */
    getMarketIndexBySymbol(sym) {
        const i = this.data.perpMarkets.findIndex((x) => x.symbol === sym);
        if (i < 0) {
            throw RangeError(`Invalid symbol ${sym} for <State ${this.pubkey.toBase58()}>`);
        }
        return i;
    }
    getMarketKeyBySymbol(sym) {
        var _a;
        return (_a = this.data.perpMarkets[this.getMarketIndexBySymbol(sym)]) === null || _a === void 0 ? void 0 : _a.dexMarket;
    }
    getMarketBySymbol(sym) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._getMarketBySymbol[sym]) {
                this._getMarketBySymbol[sym] = yield zoMarket_1.ZoMarket.load(this.connection, this.getMarketKeyBySymbol(sym), this.provider.opts, config_1.ZO_DEX_PROGRAM_ID);
            }
            return this._getMarketBySymbol[sym];
        });
    }
    /**
     * Called by the keepers every hour to update the funding on each market.
     * @param symbol The market symbol. Ex:("BTC-PERP")
     */
    updatePerpFunding(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.getMarketBySymbol(symbol);
            return yield this.program.rpc.updatePerpFunding({
                accounts: {
                    state: this.pubkey,
                    stateSigner: this.signer,
                    cache: this.cache.pubkey,
                    dexMarket: market.address,
                    marketBids: market.bidsAddress,
                    marketAsks: market.asksAddress,
                    dexProgram: config_1.ZO_DEX_PROGRAM_ID,
                },
            });
        });
    }
    /**
     * Called by the keepers regularly to cache the oracle prices.
     * @param mockPrices Only used for testing purposes. An array of user-set prices.
     */
    cacheOracle(mockPrices) {
        return __awaiter(this, void 0, void 0, function* () {
            const oracles = this.cache.data.oracles;
            return yield this.program.rpc.cacheOracle(oracles.map((x) => x.symbol), mockPrices !== null && mockPrices !== void 0 ? mockPrices : null, {
                accounts: {
                    signer: this.wallet.publicKey,
                    cache: this.cache.pubkey,
                },
                remainingAccounts: oracles
                    .flatMap((x) => x.sources)
                    .map((x) => ({
                    isSigner: false,
                    isWritable: false,
                    pubkey: x.key,
                })),
            });
        });
    }
    /**
     * Called by the keepers to update the borrow and supply multipliers.
     * @param start The inclusive start index of the collateral array.
     * @param end The exclusive end index of the collateral array.
     */
    cacheInterestRates(start, end) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.program.rpc.cacheInterestRates(start, end, {
                accounts: {
                    signer: this.wallet.publicKey,
                    state: this.pubkey,
                    cache: this.data.cache,
                },
            });
        });
    }
}
exports.default = State;
