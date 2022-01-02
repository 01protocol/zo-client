import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { Wallet, Zo } from "../types";
/**
 * Base implementation for account classes.
 */
export default abstract class BaseAccount<T> {
    private _program;
    readonly pubkey: PublicKey;
    data: Readonly<T>;
    protected constructor(_program: Program<Zo>, pubkey: PublicKey, data: Readonly<T>);
    get program(): Program<Zo>;
    get provider(): import("@project-serum/anchor").Provider;
    get connection(): import("@solana/web3.js").Connection;
    get wallet(): Wallet;
    abstract refresh(): Promise<void>;
}
