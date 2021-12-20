import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { Wallet, Zo } from "../types";

/**
 * Base implementation for account classes.
 */
export default abstract class BaseAccount<T> {
  protected constructor(
    private _program: Program<Zo>,
    public readonly pubkey: PublicKey,
    public data: Readonly<T>,
  ) {}

  get program() {
    return this._program;
  }

  get provider() {
    return this.program.provider;
  }

  get connection() {
    return this.provider.connection;
  }

  get wallet(): Wallet {
    return this.provider.wallet;
  }

  abstract refresh(): Promise<void>;
}
