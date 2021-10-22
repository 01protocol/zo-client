import { PublicKey } from "@solana/web3.js";
import BaseAccount from "./BaseAccount";
import { ControlSchema as Schema } from "../types";

export default class Control extends BaseAccount<Schema, "control"> {
  static processData(data: Schema): Schema {
    return {
      ...data,
      openOrdersAgg: data.openOrdersAgg.filter(
        (x) => !x.key.equals(PublicKey.default),
      ),
    };
  }

  static async load(k: PublicKey) {
    return new this(
      k,
      "control",
      (await this.program.account["control"].fetch(k)) as Schema,
    );
  }
}
