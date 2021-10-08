import { ConfirmOptions, Connection, PublicKey } from "@solana/web3.js";
import { AccountClient, Program, Provider } from "@project-serum/anchor";
import { Wallet } from "../types";
import * as utils from "../utils";

export abstract class Web3Account<T> {
  pubKey: PublicKey;
  programId: PublicKey;
  connection: Connection;
  initialized = false;
  providerOpts?: ConfirmOptions;
  program: Program;
  provider: Provider;
  wallet: any;
  data: T;

  protected constructor(
    pubKey: PublicKey,
    connection: Connection,
    wallet: any,
    data: T,
    programId: PublicKey,
    opts?: ConfirmOptions,
  ) {
    this.pubKey = pubKey;
    this.programId = programId;
    this.connection = connection;
    this.data = data;
    this.wallet = wallet;
    const provider = this.getProvider(connection);
    this.providerOpts = opts;
    this.program = utils.getProgram(provider, programId);
    this.provider = Web3Account.getProvider(
      connection,
      this.wallet,
      this.providerOpts,
    );
  }

  static getProvider(
    connection: Connection,
    wallet: any,
    providerOpts?: ConfirmOptions,
  ): Provider {
    return utils.getProvider(connection, wallet, providerOpts);
  }

  static getProgram(provider: Provider, programId: PublicKey) {
    return utils.getProgram(provider, programId);
  }

  getProvider(connection?: Connection): Provider {
    if (connection) {
      this.refreshProviderAndProgram(connection);
    }
    return this.provider;
  }

  refreshProviderAndProgram(connection: Connection) {
    this.provider = Web3Account.getProvider(
      connection || this.connection,
      this.wallet,
      this.providerOpts,
    );
    this.program = Web3Account.getProgram(this.provider, this.programId);
  }
}

export default abstract class BaseAccount<T> {
  protected constructor(
    public readonly pubKey: PublicKey,
    private _program: Program,
    protected readonly accountClient: AccountClient,
    public data: Readonly<T>,
  ) {}

  get program() {
    return this._program;
  }

  get provider() {
    return this.program.provider;
  }

  get wallet(): Wallet {
    return this.provider.wallet;
  }

  get connection() {
    return this.provider.connection;
  }

  async refresh(): Promise<void> {
    this.data = (await this.accountClient.fetch(this.pubKey)) as T;
  }

  async reloadProgram(conn?: Connection, opts?: ConfirmOptions): Promise<void> {
    const provider = new Provider(conn ?? this.connection, this.wallet, {
      skipPreflight: true,
      ...opts,
    });
    this._program = new Program(
      this.program.idl,
      this.program.programId,
      provider,
    );
  }
}
