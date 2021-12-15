import { PublicKey } from "@solana/web3.js";
import { Wallet } from "../types";
import { getProgram } from "../global";

export default abstract class BaseAccount<T> {
  protected constructor(
    public readonly pubkey: PublicKey,
    public data: Readonly<T>,
  ) {}

  static get program() {
    return getProgram();
  }

  static get provider() {
    return this.program.provider;
  }

  static get connection() {
    return this.provider.connection;
  }

  static get wallet(): Wallet {
    return this.provider.wallet;
  }

  get program() {
    return BaseAccount.program;
  }

  get provider() {
    return BaseAccount.provider;
  }

  get connection() {
    return BaseAccount.connection;
  }

  get wallet() {
    return BaseAccount.wallet;
  }

  abstract refresh(): Promise<void>;
}
