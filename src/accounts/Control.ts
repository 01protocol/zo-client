import { PublicKey } from "@solana/web3.js";
import BaseAccount from "./BaseAccount";
import { ControlSchema as Schema } from "../types";

export default class Control extends BaseAccount<Schema> {
  private static async fetch(k: PublicKey): Promise<Schema> {
    const data = (await this.program.account["control"].fetch(
      k,
    )) as unknown as Schema;
    return {
      ...data,
    };
  }

  static async load(k: PublicKey) {
    return new this(k, await Control.fetch(k));
  }

  async refresh(): Promise<void> {
    this.data = await Control.fetch(this.pubkey);
  }
}
