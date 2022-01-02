"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseAccount_1 = __importDefault(require("./BaseAccount"));
/**
 * The Control account tracks a user's open orders and positions across all markets.
 */
class Control extends BaseAccount_1.default {
    /**
     * Loads a new Control object from its public key.
     * @param k The control account's public key.
     */
    static load(program, k) {
        return __awaiter(this, void 0, void 0, function* () {
            return new this(program, k, yield Control.fetch(program, k));
        });
    }
    static fetch(program, k) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = (yield program.account["control"].fetch(k, "recent"));
            return Object.assign({}, data);
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this.data = yield Control.fetch(this.program, this.pubkey);
        });
    }
}
exports.default = Control;
