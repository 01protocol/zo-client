"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base implementation for account classes.
 */
class BaseAccount {
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
exports.default = BaseAccount;
