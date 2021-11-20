import {PublicKey} from '@solana/web3.js';
import {AccountClient, Program} from '@project-serum/anchor';
import {Wallet, Zo} from '../types';
import {getProgram} from '../global';

export default abstract class BaseAccount<T, K extends keyof Program<Zo>['account']> {
    protected constructor(
        public readonly pubkey: PublicKey,
        protected readonly accountClientName: K,
        public data: Readonly<T>
    ) {
    }

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
        return this.program.account[this.accountClientName]!;
    }

    abstract refresh(): Promise<void>;
}
