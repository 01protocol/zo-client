var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction, } from "@solana/web3.js";
import { AccountLayout as TokenAccountLayout, AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, MintLayout, Token, TOKEN_PROGRAM_ID, u64, } from "@solana/spl-token";
import { Program } from "@project-serum/anchor";
import Decimal from "decimal.js";
import { blob, struct, u8 } from "buffer-layout";
import { IDL, RENT_PROGRAM_ID, WRAPPED_SOL_MINT, ZERO_ONE_PROGRAM_ID, } from "../config";
export * from "./rpc";
export * from "./units";
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
export function createProgram(provider) {
    return new Program(IDL, ZERO_ONE_PROGRAM_ID, provider);
}
export function loadWI80F48({ data }) {
    return new Decimal(`${data.isNeg() ? "-" : ""}0b${data.abs().toString(2)}p-48`);
}
const utf8Decoder = new TextDecoder("utf-8");
export function loadSymbol({ data: s }) {
    // Need to convert symbol, which is a [u8; 24], to a JS String.
    // Can't use String.fromCodePoint since that takes in u16,
    // when we are receiving a UTF-8 byte array.
    let i = s.indexOf(0);
    i = i < 0 ? s.length : i;
    return utf8Decoder.decode(new Uint8Array(s.slice(0, i)));
}
/**
 * Instead of returning -1 if the element is not found,
 * return `array.length`. Much easier to use for slicing.
 */
export function findIndexOf(l, p) {
    for (let i = 0; i < l.length; ++i) {
        if (p(l[i])) {
            return i;
        }
    }
    return l.length;
}
export function findLastIndexOf(l, p) {
    for (let i = l.length - 1; i >= 0; --i) {
        if (p(l[i])) {
            return i;
        }
    }
    return -1;
}
export function getMintInfo(provider, pubkey) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const data = (_a = (yield provider.connection.getAccountInfo(pubkey))) === null || _a === void 0 ? void 0 : _a.data;
        if (!data)
            throw Error(`Couldn't load mint data for ${pubkey.toBase58()}`);
        const m = MintLayout.decode(data);
        return {
            mintAuthority: new PublicKey(m.mintAuthority),
            supply: u64.fromBuffer(m.supply),
            decimals: m.decimals,
            isInitialized: !!m.isInitialized,
            freezeAuthority: new PublicKey(m.freezeAuthority),
        };
    });
}
export function createMintIxs(mint, provider, authority, decimals, freezeAuthority) {
    return __awaiter(this, void 0, void 0, function* () {
        return [
            SystemProgram.createAccount({
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: mint.publicKey,
                space: MintLayout.span,
                lamports: yield Token.getMinBalanceRentForExemptMint(provider.connection),
                programId: TOKEN_PROGRAM_ID,
            }),
            Token.createInitMintInstruction(TOKEN_PROGRAM_ID, mint.publicKey, decimals, authority, freezeAuthority !== null && freezeAuthority !== void 0 ? freezeAuthority : null),
        ];
    });
}
export function createTokenAccountIxs(vault, provider, mint, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        return [
            SystemProgram.createAccount({
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: vault.publicKey,
                space: AccountLayout.span,
                lamports: yield Token.getMinBalanceRentForExemptAccount(provider.connection),
                programId: TOKEN_PROGRAM_ID,
            }),
            Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, mint, vault.publicKey, owner),
        ];
    });
}
export function createMintToIxs(mint, dest, authority, amount) {
    return [
        Token.createMintToInstruction(TOKEN_PROGRAM_ID, mint, dest, authority, [], amount),
    ];
}
export function createMint(provider, authority, decimals, freezeAuthority) {
    return __awaiter(this, void 0, void 0, function* () {
        const mint = new Keypair();
        const tx = new Transaction();
        tx.add(...(yield createMintIxs(mint, provider, authority, decimals, freezeAuthority)));
        yield provider.send(tx, [mint]);
        return mint.publicKey;
    });
}
export function createTokenAccount(provider, mint, owner) {
    return __awaiter(this, void 0, void 0, function* () {
        const vault = Keypair.generate();
        const tx = new Transaction();
        tx.add(...(yield createTokenAccountIxs(vault, provider, mint, owner)));
        yield provider.send(tx, [vault]);
        return vault.publicKey;
    });
}
export function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield PublicKey.findProgramAddress([
            walletAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            tokenMintAddress.toBuffer(),
        ], ASSOCIATED_TOKEN_PROGRAM_ID))[0];
    });
}
export function getAssociatedTokenTransactionWithPayer(tokenMintAddress, associatedTokenAddress, owner) {
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
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: RENT_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
}
export function mintTo(provider, mint, dest, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = new Transaction();
        tx.add(...createMintToIxs(mint, dest, provider.wallet.publicKey, amount));
        yield provider.send(tx, []);
    });
}
export function throwIfNull(value, message = "account not found") {
    if (value === null) {
        throw new Error(message);
    }
    return value;
}
const MINT_LAYOUT = struct([blob(44), u8("decimals"), blob(37)]);
export function getMintDecimals(connection, mint) {
    return __awaiter(this, void 0, void 0, function* () {
        if (mint.equals(WRAPPED_SOL_MINT)) {
            return 9;
        }
        const { data } = throwIfNull(yield connection.getAccountInfo(mint), "mint not found");
        const { decimals } = MINT_LAYOUT.decode(data);
        return decimals;
    });
}
export function getWrappedSolInstructionsAndKey(initialSmollAmount, provider) {
    return __awaiter(this, void 0, void 0, function* () {
        // sol wrapping code taken from jet: https://github.com/jet-lab/jet-v1/blob/30c56d5c14b68685466164fc45c96080f1d9348a/app/src/scripts/jet.ts
        const intermediaryKeypair = Keypair.generate();
        const intermediary = intermediaryKeypair.publicKey;
        const rent = yield provider.connection.getMinimumBalanceForRentExemption(TokenAccountLayout.span);
        const createTokenAccountIx = SystemProgram.createAccount({
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: intermediary,
            programId: TOKEN_PROGRAM_ID,
            space: TokenAccountLayout.span,
            lamports: parseInt(initialSmollAmount.addn(rent).toString()),
        });
        const initTokenAccountIx = Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, WRAPPED_SOL_MINT, intermediary, provider.wallet.publicKey);
        const closeTokenAccountIx = Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, intermediary, provider.wallet.publicKey, provider.wallet.publicKey, []);
        return {
            createTokenAccountIx,
            initTokenAccountIx,
            closeTokenAccountIx,
            intermediary,
            intermediaryKeypair,
        };
    });
}
