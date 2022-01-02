/**
 * Base implementation for account classes.
 */
export default class BaseAccount {
    constructor(_program, pubkey, data) {
        this._program = _program;
        this.pubkey = pubkey;
        this.data = data;
    }
    get program() {
        return this._program;
    }
    get provider() {
        return this.program.provider;
    }
    get connection() {
        return this.provider.connection;
    }
    get wallet() {
        return this.provider.wallet;
    }
}
