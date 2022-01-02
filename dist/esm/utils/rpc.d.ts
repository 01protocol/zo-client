/// <reference types="node" />
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
export declare function getFilteredProgramAccounts(connection: Connection, programId: PublicKey, filters: any): Promise<{
    publicKey: PublicKey;
    accountInfo: AccountInfo<Buffer>;
}[]>;
export declare function getEpoch(connection: Connection): Promise<any>;
export declare function getCurrentSlot(connection: Connection): Promise<any>;
export declare function getSignaturesForAddress(connection: Connection, address: PublicKey): Promise<any>;
export declare function getSignaturesForAddressRecent(connection: Connection, address: PublicKey): Promise<any>;
export declare function getTransaction(connection: Connection, transaction: string): Promise<any>;
