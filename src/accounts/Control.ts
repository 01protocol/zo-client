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
  static async load(program: Program<Zo>, k: PublicKey) {
    return new this(program, k, await Control.fetch(program, k));
  }

  private static async fetch(
    program: Program<Zo>,
    k: PublicKey,
  ): Promise<Schema> {
    const data = (await program.account["control"].fetch(
      k,
    )) as unknown as Schema;
    return {
      ...data,
    };
  }

  async refresh(): Promise<void> {
    this.data = await Control.fetch(this.program, this.pubkey);
  }
}
