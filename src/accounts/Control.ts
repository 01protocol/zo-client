import { PublicKey } from "@solana/web3.js";
import BaseAccount from "./BaseAccount";
import { ControlSchema as Schema } from "../types";

export default class Control extends BaseAccount<Schema, "control"> {
  private static async fetch(k: PublicKey): Promise<Schema> {
    const data = this.program.account["control"].fetch(k) as unknown as Schema;
    return {
      ...data,
    };
  }

  static async load(k: PublicKey) {
    return new this(k, "control", await Control.fetch(k));
  }

  async refresh(): Promise<void> {
    this.data = await Control.fetch(this.pubkey);
  }
}
