import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import BaseAccount from "./BaseAccount";
import { ControlSchema as Schema, Zo } from "../types";
/**
 * The Control account tracks a user's open orders and positions across all markets.
 */
export default class Control extends BaseAccount<Schema> {
    /**
     * Loads a new Control object from its public key.
     * @param k The control account's public key.
     */
    static load(program: Program<Zo>, k: PublicKey): Promise<Control>;
    private static fetch;
    refresh(): Promise<void>;
}
