var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PublicKey } from "@solana/web3.js";
export function getFilteredProgramAccounts(connection, programId, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const resp = yield connection._rpcRequest("getProgramAccounts", [
            programId.toBase58(),
            {
                commitment: connection.commitment,
                filters,
                encoding: "base64",
            },
        ]);
        if (resp.error) {
            throw new Error(resp.error.message);
        }
        // @ts-ignore
        return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
            publicKey: new PublicKey(pubkey),
            accountInfo: {
                data: Buffer.from(data[0], "base64"),
                executable,
                owner: new PublicKey(owner),
                lamports,
            },
        }));
    });
}
export function getEpoch(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const resp = yield connection._rpcRequest("getEpochInfo", [
            {
                commitment: "finalized",
            },
        ]);
        if (resp.error) {
            throw new Error(resp.error.message);
        }
        return resp.result;
    });
}
export function getCurrentSlot(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield getEpoch(connection);
        return res.absoluteSlot;
    });
}
export function getSignaturesForAddress(connection, address) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const resp = yield connection._rpcRequest("getSignaturesForAddress", [
            address.toBase58(),
            {
                commitment: "finalized",
            },
        ]);
        if (resp.error) {
            throw new Error(resp.error.message);
        }
        return resp.result;
    });
}
export function getSignaturesForAddressRecent(connection, address) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const resp = yield connection._rpcRequest("getSignaturesForAddress", [
            address.toBase58(),
            {
                commitment: "recent",
            },
        ]);
        if (resp.error) {
            throw new Error(resp.error.message);
        }
        return resp.result;
    });
}
export function getTransaction(connection, transaction) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const resp = yield connection._rpcRequest("getTransaction", [
            transaction,
            {
                commitment: "finalized",
                encoding: "base64",
            },
        ]);
        if (resp.error) {
            throw new Error(resp.error.message);
        }
        return resp.result;
    });
}
