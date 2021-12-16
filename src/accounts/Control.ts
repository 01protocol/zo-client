import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import BaseAccount from "./BaseAccount";
import { Zo, ControlSchema as Schema } from "../types";

export default class Control extends BaseAccount<Schema> {
  private static async fetch(
    program: Program<Zo>,
    k: PublicKey,
  ): Promise<Schema> {
    const data = ((await program.account["control"].fetch(
      k,
    )) as unknown) as Schema;
    return {
      ...data,
    };
  }

  static async load(program: Program<Zo>, k: PublicKey) {
    return new this(program, k, await Control.fetch(program, k));
  }

  async refresh(): Promise<void> {
    this.data = await Control.fetch(this.program, this.pubkey);
  }
}
