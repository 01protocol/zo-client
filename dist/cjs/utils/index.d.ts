import { Connection, Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { MintInfo } from "@solana/spl-token";
import { Program, Provider } from "@project-serum/anchor";
import BN from "bn.js";
import Decimal from "decimal.js";
import { Zo } from "../types";
export * from "./rpc";
export * from "./units";
export declare function sleep(ms: number): Promise<void>;
export declare function createProgram(provider: Provider): Program<Zo>;
export declare function loadWI80F48({ data }: {
    data: BN;
}): Decimal;
export declare function loadSymbol({ data: s }: {
    data: number[];
}): string;
/**
 * Instead of returning -1 if the element is not found,
 * return `array.length`. Much easier to use for slicing.
 */
export declare function findIndexOf<T>(l: readonly T[], p: (T: any) => boolean): number;
export declare function findLastIndexOf<T>(l: readonly T[], p: (T: any) => boolean): number;
export declare function getMintInfo(provider: Provider, pubkey: PublicKey): Promise<MintInfo>;
export declare function createMintIxs(mint: Keypair, provider: Provider, authority: PublicKey, decimals: number, freezeAuthority?: PublicKey): Promise<TransactionInstruction[]>;
export declare function createTokenAccountIxs(vault: Keypair, provider: Provider, mint: PublicKey, owner: PublicKey): Promise<TransactionInstruction[]>;
export declare function createMintToIxs(mint: PublicKey, dest: PublicKey, authority: PublicKey, amount: number): TransactionInstruction[];
export declare function createMint(provider: Provider, authority: PublicKey, decimals: number, freezeAuthority?: PublicKey): Promise<PublicKey>;
export declare function createTokenAccount(provider: Provider, mint: PublicKey, owner: PublicKey): Promise<PublicKey>;
export declare function findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey): Promise<PublicKey>;
export declare function getAssociatedTokenTransactionWithPayer(tokenMintAddress: PublicKey, associatedTokenAddress: PublicKey, owner: PublicKey): TransactionInstruction;
export declare function mintTo(provider: Provider, mint: PublicKey, dest: PublicKey, amount: number): Promise<void>;
export declare function throwIfNull<T>(value: T | null, message?: string): T;
export declare function getMintDecimals(connection: Connection, mint: PublicKey): Promise<number>;
export declare function getWrappedSolInstructionsAndKey(initialSmollAmount: any, provider: any): Promise<{
    createTokenAccountIx: TransactionInstruction;
    initTokenAccountIx: TransactionInstruction;
    closeTokenAccountIx: TransactionInstruction;
    intermediary: PublicKey;
    intermediaryKeypair: Keypair;
}>;
