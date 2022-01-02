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
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const lite_serum_1 = require("@zero_one/lite-serum");
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer");
const BaseAccount_1 = __importDefault(require("./BaseAccount"));
const Control_1 = __importDefault(require("./Control"));
const Num_1 = __importDefault(require("../Num"));
const utils_1 = require("../utils");
const config_1 = require("../config");
const market_1 = require("@zero_one/lite-serum/lib/market");
/**
 * The margin account is a PDA generated using
 * ```javascript
 * seeds=[userWalletKey, stateKey, "marginv1"]
 * ```.
 */
class Margin extends BaseAccount_1.default {
    constructor(program, pubkey, data, control, state) {
        super(program, pubkey, data);
        this.control = control;
        this.state = state;
    }
    /**
     * Loads a new Margin object.
     */
    static load(program, st, ch) {
        return __awaiter(this, void 0, void 0, function* () {
            const [key, _nonce] = yield this.getPda(st, program.provider.wallet.publicKey, program.programId);
            const data = yield this.fetch(program, key, st, ch);
            const control = yield Control_1.default.load(program, data.control);
            return new this(program, key, data, control, st);
        });
    }
    /**
     * Creates a margin account.
     * @param program The Zo Program
     * @param st The Zo State object, overrides the default config.
     * @param commitment commitment of the transaction, finalized is used as default
     */
    static create(program, st, commitment = "finalized") {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = program.provider.connection;
            const [[key, nonce], control, controlLamports] = yield Promise.all([
                this.getPda(st, program.provider.wallet.publicKey, program.programId),
                web3_js_1.Keypair.generate(),
                conn.getMinimumBalanceForRentExemption(config_1.CONTROL_ACCOUNT_SIZE),
            ]);
            yield conn.confirmTransaction(yield program.rpc.createMargin(nonce, {
                accounts: {
                    state: st.pubkey,
                    authority: program.provider.wallet.publicKey,
                    margin: key,
                    control: control.publicKey,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    systemProgram: web3_js_1.SystemProgram.programId,
                },
                preInstructions: [
                    web3_js_1.SystemProgram.createAccount({
                        fromPubkey: program.provider.wallet.publicKey,
                        newAccountPubkey: control.publicKey,
                        lamports: controlLamports,
                        space: config_1.CONTROL_ACCOUNT_SIZE,
                        programId: program.programId,
                    }),
                ],
                signers: [control],
            }), commitment);
            return yield Margin.load(program, st, st.cache);
        });
    }
    /**
     * Gets the Margin account's PDA and bump.
     * @returns An array consisting of [PDA, bump]
     */
    static getPda(st, traderKey, programId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield web3_js_1.PublicKey.findProgramAddress([traderKey.toBuffer(), st.pubkey.toBuffer(), buffer_1.Buffer.from("marginv1")], programId);
        });
    }
    static fetch(program, k, st, ch) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield program.account["margin"].fetch(k, program.provider.connection.commitment));
            const rawCollateral = data.collateral
                .map((c) => (0, utils_1.loadWI80F48)(c))
                .slice(0, st.data.totalCollaterals);
            return Object.assign(Object.assign({}, data), { rawCollateral, actualCollateral: st.data.collaterals.map((c, i) => {
                    return new Num_1.default(new bn_js_1.default(rawCollateral[i].isPos()
                        ? rawCollateral[i].times(ch.data.borrowCache[i].supplyMultiplier)
                            .floor()
                            .toString()
                        : rawCollateral[i].times(ch.data.borrowCache[i].borrowMultiplier)
                            .floor()
                            .toString()), c.decimals);
                }) });
        });
    }
    /**
     * Refreshes the data on the Margin, state, cache and control accounts.
     */
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            [this.data] = yield Promise.all([
                Margin.fetch(this.program, this.pubkey, this.state, this.state.cache),
                this.control.refresh(),
                this.state.refresh(),
            ]);
        });
    }
    /**
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @returns The OpenOrders account key for the given market.
     */
    getOpenOrdersKeyBySymbol(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const dexMarket = this.state.getMarketKeyBySymbol(symbol);
            return yield web3_js_1.PublicKey.findProgramAddress([this.data.control.toBuffer(), dexMarket.toBuffer()], config_1.ZO_DEX_PROGRAM_ID);
        });
    }
    /**
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param create If true, creates the OpenOrders account if it doesn't exist.
     * @returns The OpenOrdersInfo for the given market.
     */
    getOpenOrdersInfoBySymbol(symbol, create = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketIndex = this.state.getMarketIndexBySymbol(symbol);
            let oo = this.control.data.openOrdersAgg[marketIndex];
            if (oo.key.equals(web3_js_1.PublicKey.default)) {
                if (create) {
                    yield this.createPerpOpenOrders(symbol);
                    oo = this.control.data.openOrdersAgg[marketIndex];
                }
                else {
                    return null;
                }
            }
            return oo;
        });
    }
    /**
     * Deposits a given amount of collateral into the Margin account. Raw implementation of the instruction.
     * @param tokenAccount The user's token account where tokens will be subtracted from.
     * @param vault The state vault where tokens will be deposited into.
     * @param amount The amount of tokens to deposit, in native quantity. (ex: lamports for SOL, satoshis for BTC)
     * @param repayOnly If true, will only deposit up to the amount borrowed. If true, amount parameter can be set to an arbitrarily large number to ensure that any outstanding borrow is fully repaid.
     */
    depositRaw(tokenAccount, vault, amount, repayOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.program.rpc.deposit(repayOnly, amount, {
                accounts: {
                    state: this.state.pubkey,
                    stateSigner: this.state.signer,
                    cache: this.state.cache.pubkey,
                    authority: this.wallet.publicKey,
                    margin: this.pubkey,
                    tokenAccount,
                    vault,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                },
            });
        });
    }
    /**
     * Deposits a given amount of SOL collateral into the Margin account. Raw implementation of the instruction.
     * @param vault The state vault where tokens will be deposited into.
     * @param amount The amount of tokens to deposit, in native quantity. (ex: lamports for SOL, satoshis for BTC)
     * @param repayOnly If true, will only deposit up to the amount borrowed. If true, amount parameter can be set to an arbitrarily large number to ensure that any outstanding borrow is fully repaid.
     */
    depositSol(vault, amount, repayOnly) {
        return __awaiter(this, void 0, void 0, function* () {
            const { createTokenAccountIx, initTokenAccountIx, closeTokenAccountIx, intermediary, intermediaryKeypair, } = yield (0, utils_1.getWrappedSolInstructionsAndKey)(amount, this.program.provider);
            return yield this.program.rpc.deposit(repayOnly, amount, {
                accounts: {
                    state: this.state.pubkey,
                    stateSigner: this.state.signer,
                    cache: this.state.cache.pubkey,
                    authority: this.wallet.publicKey,
                    margin: this.pubkey,
                    tokenAccount: intermediary,
                    vault,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                },
                preInstructions: [createTokenAccountIx, initTokenAccountIx],
                postInstructions: [closeTokenAccountIx],
                signers: [intermediaryKeypair],
            });
        });
    }
    /**
     * Withdraws a given amount of collateral from the Margin account to a specified token account. If withdrawing more than the amount deposited, then account will be borrowing.
     * Raw implementation of the instruction.
     * @param vault The state vault where tokens will be withdrawn from.
     * @param amount The amount of tokens to withdraw, in native quantity. (ex: lamports for SOL, satoshis for BTC)
     * @param allowBorrow If false, will only be able to withdraw up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully withdrawn.
     */
    withdrawSol(vault, amount, allowBorrow) {
        return __awaiter(this, void 0, void 0, function* () {
            const { createTokenAccountIx, initTokenAccountIx, closeTokenAccountIx, intermediary, intermediaryKeypair, } = yield (0, utils_1.getWrappedSolInstructionsAndKey)(amount, this.program.provider);
            return yield this.program.rpc.withdraw(allowBorrow, amount, {
                accounts: {
                    state: this.state.pubkey,
                    stateSigner: this.state.signer,
                    cache: this.state.cache.pubkey,
                    authority: this.wallet.publicKey,
                    margin: this.pubkey,
                    control: this.data.control,
                    tokenAccount: intermediary,
                    vault,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                },
                preInstructions: [createTokenAccountIx, initTokenAccountIx],
                postInstructions: [closeTokenAccountIx],
                signers: [intermediaryKeypair],
            });
        });
    }
    /**
     * Deposits a given amount of collateral into the Margin account from the associated token account.
     * @param mint Mint of the collateral being deposited.
     * @param size The amount of tokens to deposit, in big units. (ex: 1.5 SOL, or 0.5 BTC)
     * @param repayOnly If true, will only deposit up to the amount borrowed. If true, amount parameter can be set to an arbitrarily large number to ensure that any outstanding borrow is fully repaid.
     * @param tokenAccountProvided optional param to provide the token account to use it for deposits
     */
    deposit(mint, size, repayOnly, tokenAccountProvided) {
        return __awaiter(this, void 0, void 0, function* () {
            const [vault, collateralInfo] = this.state.getVaultCollateralByMint(mint);
            const amountSmoll = new Num_1.default(size, collateralInfo.decimals).n;
            if (config_1.WRAPPED_SOL_MINT.toString() == mint.toString()) {
                return yield this.depositSol(vault, amountSmoll, repayOnly);
            }
            const tokenAccount = tokenAccountProvided
                ? tokenAccountProvided
                : yield (0, utils_1.findAssociatedTokenAddress)(this.program.provider.wallet.publicKey, mint);
            return yield this.depositRaw(tokenAccount, vault, amountSmoll, repayOnly);
        });
    }
    /**
     * Withdraws a given amount of collateral from the Margin account to a specified token account. If withdrawing more than the amount deposited, then account will be borrowing.
     * Raw implementation of the instruction.
     * @param tokenAccount The user's token account where tokens will be withdrawn to.
     * @param vault The state vault where tokens will be withdrawn from.
     * @param amount The amount of tokens to withdraw, in native quantity. (ex: lamports for SOL, satoshis for BTC)
     * @param allowBorrow If false, will only be able to withdraw up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully withdrawn.
     * @param preInstructions instructions executed before withdrawal
     */
    withdrawRaw(tokenAccount, vault, amount, allowBorrow, preInstructions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.program.rpc.withdraw(allowBorrow, amount, {
                accounts: {
                    state: this.state.pubkey,
                    stateSigner: this.state.signer,
                    cache: this.state.cache.pubkey,
                    authority: this.wallet.publicKey,
                    margin: this.pubkey,
                    control: this.data.control,
                    tokenAccount,
                    vault,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                },
                preInstructions: preInstructions,
            });
        });
    }
    /**
     * Withdraws a given amount of collateral from the Margin account to a specified token account. If withdrawing more than the amount deposited, then account will be borrowing.
     * @param mint of the collateral being withdrawn
     * @param size The amount of tokens to withdraw, in big units. (ex: 1.5 SOL, or 0.5 BTC)
     * @param allowBorrow If false, will only be able to withdraw up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully withdrawn.
     */
    withdraw(mint, size, allowBorrow) {
        return __awaiter(this, void 0, void 0, function* () {
            const [vault, collateralInfo] = this.state.getVaultCollateralByMint(mint);
            const amountSmoll = new Num_1.default(size, collateralInfo.decimals).n;
            if (config_1.WRAPPED_SOL_MINT.toString() == mint.toString()) {
                return yield this.withdrawSol(vault, amountSmoll, allowBorrow);
            }
            const associatedTokenAccount = yield (0, utils_1.findAssociatedTokenAddress)(this.program.provider.wallet.publicKey, mint);
            //optimize: can be cached
            let associatedTokenAccountExists = false;
            if (yield this.program.provider.connection.getAccountInfo(associatedTokenAccount)) {
                associatedTokenAccountExists = true;
            }
            return yield this.withdrawRaw(associatedTokenAccount, vault, amountSmoll, allowBorrow, associatedTokenAccountExists
                ? undefined
                : [
                    (0, utils_1.getAssociatedTokenTransactionWithPayer)(mint, associatedTokenAccount, this.program.provider.wallet.publicKey),
                ]);
        });
    }
    /**
     * User must create a perp OpenOrders account for every perpetual market(future and or options) they intend to trade on.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     */
    createPerpOpenOrders(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const [ooKey, _] = yield this.getOpenOrdersKeyBySymbol(symbol);
            return yield this.program.rpc.createPerpOpenOrders({
                accounts: {
                    state: this.state.pubkey,
                    stateSigner: this.state.signer,
                    authority: this.wallet.publicKey,
                    margin: this.pubkey,
                    control: this.data.control,
                    openOrders: ooKey,
                    dexMarket: this.state.getMarketKeyBySymbol(symbol),
                    dexProgram: config_1.ZO_DEX_PROGRAM_ID,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                    systemProgram: web3_js_1.SystemProgram.programId,
                },
            });
        });
    }
    /**
     * Raw implementation of the instruction rpc call.
     * Places an order on the orderbook for a given market, using lot sizes for limit and base quantity, and native units for quote quantity.
     * Assumes an open orders account has been created already.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param orderType The order type. Either limit, immediateOrCancel, or postOnly.
     * @param isLong True if buy, false if sell.
     * @param limitPrice The limit price in base lots per quote lots.
     * @param maxBaseQty The maximum amount of base lots to buy or sell.
     * @param maxQuoteQty The maximum amount of native quote, including fees, to pay or receive.
     * @param limit If this order is taking, the limit sets the number of maker orders the fill will go through, until stopping and posting. If running into compute unit issues, then set this number lower.
     */
    placePerpOrderRaw({ symbol, orderType, isLong, limitPrice, maxBaseQty, maxQuoteQty, limit, clientId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.state.getMarketBySymbol(symbol);
            const oo = yield this.getOpenOrdersInfoBySymbol(symbol);
            return yield this.program.rpc.placePerpOrder(isLong, limitPrice, maxBaseQty, maxQuoteQty, orderType, limit !== null && limit !== void 0 ? limit : 10, clientId !== null && clientId !== void 0 ? clientId : new bn_js_1.default(0), {
                accounts: {
                    state: this.state.pubkey,
                    stateSigner: this.state.signer,
                    cache: this.state.cache.pubkey,
                    authority: this.wallet.publicKey,
                    margin: this.pubkey,
                    control: this.control.pubkey,
                    openOrders: oo.key,
                    dexMarket: market.address,
                    reqQ: market.requestQueueAddress,
                    eventQ: market.eventQueueAddress,
                    marketBids: market.bidsAddress,
                    marketAsks: market.asksAddress,
                    dexProgram: config_1.ZO_DEX_PROGRAM_ID,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                },
            });
        });
    }
    /**
     * Places a perp order on the orderbook. Creates an Open orders account if does not exist, in the same transaction.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param orderType The order type. Either limit, immediateOrCancel, or postOnly.
     * @param isLong True if buy, false if sell.
     * @param price The limit price in big quote units per big base units. Ex: (50,000 USD/SOL)
     * @param size The maximum amount of big base units to buy or sell.
     * @param limit If this order is taking, the limit sets the number of maker orders the fill will go through, until stopping and posting. If running into compute unit issues, then set this number lower.
     * @param clientId Used to tag an order with a unique id, which can be used to cancel this order through cancelPerpOrderByClientId. For optimal use, make sure all ids for every order is unique.
     */
    placePerpOrder({ symbol, orderType, isLong, price, size, limit, clientId, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.state.getMarketBySymbol(symbol);
            const limitPriceBn = market.priceNumberToLots(price);
            const maxBaseQtyBn = market.baseSizeNumberToLots(size);
            const takerFee = market.decoded.perpType.toNumber() === 1
                ? config_1.ZO_FUTURE_TAKER_FEE
                : config_1.ZO_OPTION_TAKER_FEE;
            const feeMultiplier = isLong ? 1 + takerFee : 1 - takerFee;
            const maxQuoteQtyBn = new bn_js_1.default(Math.round(limitPriceBn
                .mul(maxBaseQtyBn)
                .mul(market.decoded["quoteLotSize"])
                .toNumber() * feeMultiplier));
            console.log("maxquoteqty ", maxQuoteQtyBn.toNumber());
            let ooKey;
            const oo = yield this.getOpenOrdersInfoBySymbol(symbol);
            let createOo;
            if (!oo) {
                ooKey = (yield this.getOpenOrdersKeyBySymbol(symbol))[0];
                createOo = true;
            }
            else {
                ooKey = oo.key;
                createOo = false;
            }
            return yield this.program.rpc.placePerpOrder(isLong, limitPriceBn, maxBaseQtyBn, maxQuoteQtyBn, orderType, limit !== null && limit !== void 0 ? limit : 10, new bn_js_1.default(clientId !== null && clientId !== void 0 ? clientId : 0), {
                accounts: {
                    state: this.state.pubkey,
                    stateSigner: this.state.signer,
                    cache: this.state.cache.pubkey,
                    authority: this.wallet.publicKey,
                    margin: this.pubkey,
                    control: this.control.pubkey,
                    openOrders: ooKey,
                    dexMarket: market.address,
                    reqQ: market.requestQueueAddress,
                    eventQ: market.eventQueueAddress,
                    marketBids: market.bidsAddress,
                    marketAsks: market.asksAddress,
                    dexProgram: config_1.ZO_DEX_PROGRAM_ID,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                },
                preInstructions: createOo
                    ? [
                        this.program.instruction.createPerpOpenOrders({
                            accounts: {
                                state: this.state.pubkey,
                                stateSigner: this.state.signer,
                                authority: this.wallet.publicKey,
                                margin: this.pubkey,
                                control: this.data.control,
                                openOrders: ooKey,
                                dexMarket: this.state.getMarketKeyBySymbol(symbol),
                                dexProgram: config_1.ZO_DEX_PROGRAM_ID,
                                rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                                systemProgram: web3_js_1.SystemProgram.programId,
                            },
                        }),
                    ]
                    : undefined,
            });
        });
    }
    /**
     * Cancels an order on the orderbook for a given market by order id.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param isLong True if the order being cancelled is a buy order, false if sell order.
     * @param orderId The order id of the order to cancel. To get order id, call loadOrdersForOwner through the market.
     */
    cancelPerpOrder(symbol, isLong, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.state.getMarketBySymbol(symbol);
            const oo = yield this.getOpenOrdersInfoBySymbol(symbol);
            return yield this.program.rpc.cancelPerpOrder(orderId, isLong, {
                accounts: {
                    state: this.state.pubkey,
                    cache: this.state.cache.pubkey,
                    authority: this.wallet.publicKey,
                    margin: this.pubkey,
                    control: this.control.pubkey,
                    openOrders: oo.key,
                    dexMarket: market.address,
                    marketBids: market.bidsAddress,
                    marketAsks: market.asksAddress,
                    eventQ: market.eventQueueAddress,
                    dexProgram: config_1.ZO_DEX_PROGRAM_ID,
                },
            });
        });
    }
    /**
     * Cancels an order on the orderbook for a given market that was pre-assigned a unique clientId.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param clientId The client id that was assigned to the order when it was placed.
     */
    cancelPerpOrderByClientId(symbol, clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.state.getMarketBySymbol(symbol);
            const oo = yield this.getOpenOrdersInfoBySymbol(symbol);
            return yield this.program.rpc.cancelPerpOrderByClientId(new bn_js_1.default(clientId), {
                accounts: {
                    state: this.state.pubkey,
                    cache: this.state.cache.pubkey,
                    authority: this.wallet.publicKey,
                    margin: this.pubkey,
                    control: this.control.pubkey,
                    openOrders: oo.key,
                    dexMarket: market.address,
                    marketBids: market.bidsAddress,
                    marketAsks: market.asksAddress,
                    eventQ: market.eventQueueAddress,
                    dexProgram: config_1.ZO_DEX_PROGRAM_ID,
                },
            });
        });
    }
    /**
     * Swaps between USDC and a given Token B (or vice versa) on the Serum Spot DEX. This is a direct IOC trade that instantly settles.
     * Note that the token B needs to be swappable, as enabled by the 01 program.
     * @param buy If true, then swapping USDC for Token B. If false, the swapping Token B for USDC.
     * @param tokenMint The mint public key of Token B.
     * @param fromSize The amount of tokens to swap *from*. If buy, this is USDC. If not buy, this is Token B. This is in big units (ex: 0.5 BTC or 1.5 SOL, not satoshis nor lamports).
     * @param toSize The amount of tokens to swap *to*. In other words, the amount of expected to tokens. If buy, this is Token B. If not buy, this is USDC. This is in big units (ex: 0.5 BTC or 1.5 SOL, not satoshis nor lamports).
     * @param slippage The tolerance for the amount of tokens received changing from its expected toSize. Number between 0 - 1, if 1, then max slippage.
     * @param allowBorrow If false, will only be able to swap up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully swapped.
     * @param serumMarket The market public key of the Serum Spot DEX.
     */
    swap({ buy, tokenMint, fromSize, toSize, slippage, allowBorrow, serumMarket, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state.data.totalCollaterals < 1) {
                throw new Error(`<State ${this.state.pubkey.toString()}> does not have a base collateral`);
            }
            if (slippage > 1 || slippage < 0) {
                throw new Error("Invalid slippage input, must be between 0 and 1");
            }
            const market = yield lite_serum_1.Market.load(this.connection, serumMarket, {}, config_1.SERUM_SPOT_PROGRAM_ID);
            const colIdx = this.state.getCollateralIndex(tokenMint);
            const stateQuoteMint = this.state.data.collaterals[0].mint;
            // TODO: optimize below to avoid fetching
            const baseDecimals = yield (0, market_1.getMintDecimals)(this.connection, tokenMint);
            const amount = buy
                ? new bn_js_1.default(fromSize * Math.pow(10, config_1.USDC_DECIMALS))
                : new bn_js_1.default(fromSize * Math.pow(10, baseDecimals));
            const minRate = slippage === 1
                ? new bn_js_1.default(1)
                : new Num_1.default((toSize * (1 - slippage)) / fromSize, buy ? baseDecimals : config_1.USDC_DECIMALS).n;
            if (!market.baseMintAddress.equals(tokenMint) ||
                !market.quoteMintAddress.equals(stateQuoteMint)) {
                throw new Error(`Invalid <SerumSpotMarket ${serumMarket}> for swap:\n` +
                    `  swap wants:   base=${tokenMint}, quote=${stateQuoteMint}\n` +
                    `  market wants: base=${market.baseMintAddress}, quote=${market.quoteMintAddress}`);
            }
            const vaultSigner = yield web3_js_1.PublicKey.createProgramAddress([
                market.address.toBuffer(),
                market.decoded.vaultSignerNonce.toArrayLike(buffer_1.Buffer, "le", 8),
            ], config_1.SERUM_SPOT_PROGRAM_ID);
            return yield this.program.rpc.swap(buy, allowBorrow, amount, minRate, {
                accounts: {
                    authority: this.wallet.publicKey,
                    state: this.state.pubkey,
                    stateSigner: this.state.signer,
                    cache: this.state.data.cache,
                    margin: this.pubkey,
                    control: this.data.control,
                    quoteMint: stateQuoteMint,
                    quoteVault: this.state.data.vaults[0],
                    assetMint: tokenMint,
                    assetVault: this.state.getVaultCollateralByMint(tokenMint)[0],
                    swapFeeVault: this.state.data.swapFeeVault,
                    serumOpenOrders: this.state.data.collaterals[colIdx].serumOpenOrders,
                    serumMarket,
                    serumRequestQueue: market.decoded.requestQueue,
                    serumEventQueue: market.decoded.eventQueue,
                    serumBids: market.bidsAddress,
                    serumAsks: market.asksAddress,
                    serumCoinVault: market.decoded.baseVault,
                    serumPcVault: market.decoded.quoteVault,
                    serumVaultSigner: vaultSigner,
                    srmSpotProgram: config_1.SERUM_SPOT_PROGRAM_ID,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    rent: web3_js_1.SYSVAR_RENT_PUBKEY,
                },
            });
        });
    }
    /**
     * Settles unrealized funding and realized PnL into the margin account for a given market.
     * @param symbol Market symbol (ex: BTC-PERP).
     */
    settleFunds(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = yield this.state.getMarketBySymbol(symbol);
            const oo = yield this.getOpenOrdersInfoBySymbol(symbol);
            return yield this.program.rpc.settleFunds({
                accounts: {
                    authority: this.wallet.publicKey,
                    state: this.state.pubkey,
                    stateSigner: this.state.signer,
                    cache: this.state.data.cache,
                    margin: this.pubkey,
                    control: this.data.control,
                    openOrders: oo.key,
                    dexMarket: market.address,
                    dexProgram: config_1.ZO_DEX_PROGRAM_ID,
                },
            });
        });
    }
}
exports.default = Margin;
