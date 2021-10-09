import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import BaseAccount from "./BaseAccount";

export interface Schema {
  nonce: number;
  admin: PublicKey;
  vault: PublicKey;
}

export default class State extends BaseAccount<Schema> {
  private static _prevPid: PublicKey | null = null;
  private static _programAddress: [PublicKey, number] | null = null;

  public static async programAddress(): Promise<[PublicKey, number]> {
    if (
      this._prevPid == null ||
      this._programAddress == null ||
      !this.program.programId.equals(this._prevPid)
    ) {
      this._prevPid = this.program.programId;
      this._programAddress = await PublicKey.findProgramAddress(
        [Buffer.from("statev1")],
        this._prevPid,
      );
    }
    return this._programAddress;
  }

  static async init(vault: PublicKey): Promise<State> {
    const [key, nonce] = await this.programAddress();

    await this.program.rpc.initState!(nonce, {
      accounts: {
        admin: this.provider.wallet.publicKey,
        state: key,
        vault,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
    });

    return await State.load();
  }

  static async load(): Promise<State> {
    const accName = "state";
    const stateKey = (await State.programAddress())[0];
    const data = await this.program.account[accName]!.fetch(stateKey);
    return new this(stateKey, "state", data as Schema);
  }
}
