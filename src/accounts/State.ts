import { Provider } from "@project-serum/anchor";
import {
  ConfirmOptions,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import BaseAccount, { Web3Account } from "./BaseAccount";
import { ZERO_ONE_MARGIN_PROGRAM_ID } from "../config";

const PDA_SEED = [Buffer.from("statev1")];

export interface Schema {
  nonce: number;
  admin: PublicKey;
  vault: PublicKey;
}

export default class State extends BaseAccount<Schema> {
  private static _programAddress: [PublicKey, number] | undefined = undefined;

  public static async programAddress() {
    if (State._programAddress === undefined) {
      State._programAddress = await PublicKey.findProgramAddress(
        PDA_SEED,
        ZERO_ONE_MARGIN_PROGRAM_ID,
      );
    }
    return State._programAddress;
  }

  static async init(vault: PublicKey, provider: Provider): Promise<State> {
    const [key, nonce] = await State.programAddress();
    const program = Web3Account.getProgram(
      provider,
      ZERO_ONE_MARGIN_PROGRAM_ID,
    );

    await program.rpc.initState!(nonce, {
      accounts: {
        admin: provider.wallet.publicKey,
        state: key,
        vault,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
    });

    return await State.load(provider.connection, provider.wallet);
  }

  static async load(
    connection: Connection,
    wallet: any,
    opts?: ConfirmOptions,
  ): Promise<State> {
    const stateKey =  (await State.programAddress())[0];
    const provider = Web3Account.getProvider(connection, wallet, opts);
    const program = Web3Account.getProgram(
      provider,
      ZERO_ONE_MARGIN_PROGRAM_ID,
    );
    const client = program.account.state!;
    const data = await client.fetch(stateKey);
    return new this(stateKey, program, client, data as Schema);
  }
}
