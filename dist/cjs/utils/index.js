"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
exports.getWrappedSolInstructionsAndKey = exports.getMintDecimals = exports.throwIfNull = exports.mintTo = exports.getAssociatedTokenTransactionWithPayer = exports.findAssociatedTokenAddress = exports.createTokenAccount = exports.createMint = exports.createMintToIxs = exports.createTokenAccountIxs = exports.createMintIxs = exports.getMintInfo = exports.findLastIndexOf = exports.findIndexOf = exports.loadSymbol = exports.loadWI80F48 = exports.createProgram = exports.sleep = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const anchor_1 = require("@project-serum/anchor");
const decimal_js_1 = __importDefault(require("decimal.js"));
const buffer_layout_1 = require("buffer-layout");
const config_1 = require("../config");
__exportStar(require("./rpc"), exports);
__exportStar(require("./units"), exports);
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function createProgram(provider) {
    return new anchor_1.Program(config_1.IDL, config_1.ZERO_ONE_PROGRAM_ID, provider);
}
exports.createProgram = createProgram;
function loadWI80F48({ data }) {
    return new decimal_js_1.default(`${data.isNeg() ? "-" : ""}0b${data.abs().toString(2)}p-48`);
}
exports.loadWI80F48 = loadWI80F48;
const utf8Decoder = new TextDecoder("utf-8");
function loadSymbol({ data: s }) {
    // Need to convert symbol, which is a [u8; 24], to a JS String.
    // Can't use String.fromCodePoint since that takes in u16,
    // when we are receiving a UTF-8 byte array.
    let i = s.indexOf(0);
    i = i < 0 ? s.length : i;
    return utf8Decoder.decode(new Uint8Array(s.slice(0, i)));
}
exports.loadSymbol = loadSymbol;
/**
 * Instead of returning -1 if the element is not found,
 * return `array.length`. Much easier to use for slicing.
 */
function findIndexOf(l, p) {
    for (let i = 0; i < l.length; ++i) {
        if (p(l[i])) {
            return i;
        }
    }
    return l.length;
}
exports.findIndexOf = findIndexOf;
function findLastIndexOf(l, p) {
    for (let i = l.length - 1; i >= 0; --i) {
        if (p(l[i])) {
            return i;
        }
    }
    return -1;
}
exports.findLastIndexOf = findLastIndexOf;
function getMintInfo(provider, pubkey) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const data = (_a = (yield provider.connection.getAccountInfo(pubkey))) === null || _a === void 0 ? void 0 : _a.data;
        if (!data)
            throw Error(`Couldn't load mint data for ${pubkey.toBase58()}`);
        const m = spl_token_1.MintLayout.decode(data);
        return {
            mintAuthority: new web3_js_1.PublicKey(m.mintAuthority),
            supply: spl_token_1.u64.fromBuffer(m.supply),
            decimals: m.decimals,
            isInitialized: !!m.isInitialized,
            freezeAuthority: new web3_js_1.PublicKey(m.freezeAuthority),
        };
    });
}
exports.getMintInfo = getMintInfo;
function createMintIxs(mint, provider, authority, decimals, freezeAuthority) {
    return __awaiter(this, void 0, void 0, function* () {
        return [
            web3_js_1.SystemProgram.createAccount({
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: mint.publicKey,
                space: spl_token_1.MintLayout.span,
                lamports: yield spl_token_1.Token.getMinBalanceRentForExemptMint(provider.connection),
                programId: spl_token_1.TOKEN_PROGRAM_ID,
            }),
            spl_token_1.Token.createInitMintInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, decimals, authority, freezeAuthority !== null && freezeAuthority !== void 0 ? freezeAuthority : null),
        ];
    });
}
exports.createMintIxs = createMintIxs;
function createTokenAccountIxs(vault, provider, mint, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        return [
            web3_js_1.SystemProgram.createAccount({
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: vault.publicKey,
                space: spl_token_1.AccountLayout.span,
                lamports: yield spl_token_1.Token.getMinBalanceRentForExemptAccount(provider.connection),
                programId: spl_token_1.TOKEN_PROGRAM_ID,
            }),
            spl_token_1.Token.createInitAccountInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, vault.publicKey, owner),
        ];
    });
}
exports.createTokenAccountIxs = createTokenAccountIxs;
function createMintToIxs(mint, dest, authority, amount) {
    return [
        spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, dest, authority, [], amount),
    ];
}
exports.createMintToIxs = createMintToIxs;
function createMint(provider, authority, decimals, freezeAuthority) {
    return __awaiter(this, void 0, void 0, function* () {
        const mint = new web3_js_1.Keypair();
        const tx = new web3_js_1.Transaction();
        tx.add(...(yield createMintIxs(mint, provider, authority, decimals, freezeAuthority)));
        yield provider.send(tx, [mint]);
        return mint.publicKey;
    });
}
exports.createMint = createMint;
function createTokenAccount(provider, mint, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        const vault = web3_js_1.Keypair.generate();
        const tx = new web3_js_1.Transaction();
        tx.add(...(yield createTokenAccountIxs(vault, provider, mint, owner)));
        yield provider.send(tx, [vault]);
        return vault.publicKey;
    });
}
exports.createTokenAccount = createTokenAccount;
function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield web3_js_1.PublicKey.findProgramAddress([
            walletAddress.toBuffer(),
            spl_token_1.TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ], spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID))[0];
    });
}
exports.findAssociatedTokenAddress = findAssociatedTokenAddress;
function getAssociatedTokenTransactionWithPayer(tokenMintAddress, associatedTokenAddress, owner) {
    const keys = [
        {
            pubkey: owner,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: owner,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: tokenMintAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: spl_token_1.TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: config_1.RENT_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
}
exports.getAssociatedTokenTransactionWithPayer = getAssociatedTokenTransactionWithPayer;
function mintTo(provider, mint, dest, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = new web3_js_1.Transaction();
        tx.add(...createMintToIxs(mint, dest, provider.wallet.publicKey, amount));
        yield provider.send(tx, []);
    });
}
exports.mintTo = mintTo;
function throwIfNull(value, message = "account not found") {
    if (value === null) {
        throw new Error(message);
    }
    return value;
}
exports.throwIfNull = throwIfNull;
const MINT_LAYOUT = (0, buffer_layout_1.struct)([(0, buffer_layout_1.blob)(44), (0, buffer_layout_1.u8)("decimals"), (0, buffer_layout_1.blob)(37)]);
function getMintDecimals(connection, mint) {
    return __awaiter(this, void 0, void 0, function* () {
        if (mint.equals(config_1.WRAPPED_SOL_MINT)) {
            return 9;
        }
        const { data } = throwIfNull(yield connection.getAccountInfo(mint), "mint not found");
        const { decimals } = MINT_LAYOUT.decode(data);
        return decimals;
    });
}
exports.getMintDecimals = getMintDecimals;
function getWrappedSolInstructionsAndKey(initialSmollAmount, provider) {
    return __awaiter(this, void 0, void 0, function* () {
        // sol wrapping code taken from jet: https://github.com/jet-lab/jet-v1/blob/30c56d5c14b68685466164fc45c96080f1d9348a/app/src/scripts/jet.ts
        const intermediaryKeypair = web3_js_1.Keypair.generate();
        const intermediary = intermediaryKeypair.publicKey;
        const rent = yield provider.connection.getMinimumBalanceForRentExemption(spl_token_1.AccountLayout.span);
        const createTokenAccountIx = web3_js_1.SystemProgram.createAccount({
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: intermediary,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
            space: spl_token_1.AccountLayout.span,
            lamports: parseInt(initialSmollAmount.addn(rent).toString()),
        });
        const initTokenAccountIx = spl_token_1.Token.createInitAccountInstruction(spl_token_1.TOKEN_PROGRAM_ID, config_1.WRAPPED_SOL_MINT, intermediary, provider.wallet.publicKey);
        const closeTokenAccountIx = spl_token_1.Token.createCloseAccountInstruction(spl_token_1.TOKEN_PROGRAM_ID, intermediary, provider.wallet.publicKey, provider.wallet.publicKey, []);
        return {
            createTokenAccountIx,
            initTokenAccountIx,
            closeTokenAccountIx,
            intermediary,
            intermediaryKeypair,
        };
    });
}
exports.getWrappedSolInstructionsAndKey = getWrappedSolInstructionsAndKey;
