import { ConfirmOptions, Connection, PublicKey } from "@solana/web3.js";
import { AccountClient, Provider } from "@project-serum/anchor";
import { Wallet } from "../types";
import { setProvider, getProgram } from "../global";

export default abstract class BaseAccount<T> {
  protected constructor(
    public readonly pubKey: PublicKey,
    protected readonly accountClientName: string,
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

  get accountClient(): AccountClient {
    return this.program[this.accountClientName]!;
  }

  async refresh(): Promise<void> {
    this.data = (await this.accountClient.fetch(this.pubKey)) as T;
  }

  // NOTE: DEPRECATED
  async reloadProgram(conn?: Connection, opts?: ConfirmOptions): Promise<void> {
    console.warn("Use of deprecated BaseAccount.reloadProgram");
    setProvider(
      new Provider(conn ?? this.connection, this.wallet, {
        skipPreflight: true,
        ...opts,
      }),
    );
  }
}
