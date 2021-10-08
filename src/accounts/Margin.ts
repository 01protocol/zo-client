import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  ConfirmOptions,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { BN, Program, Provider } from "@project-serum/anchor";
import BaseAccount from "./BaseAccount";
import TokenAccountBalance from "./TokenAccountBalance";
import State from "./State";
import {
  DEX_PROGRAM_ID,
  IDL_MARGIN,
  SKIP_PREFLIGHT,
  ZERO_ONE_MARGIN_PROGRAM_ID,
} from "../config";
import { sleep } from "../utils/sleep";
import EverlastingMarket from "./EverlastingMarket";
import EverlastingOrder from "./EverlastingOrder";
import * as anchor from "@project-serum/anchor";

// TODO: Move into config, make parameter, define constants
// for several token types.
const NUM_DECIMALS = 6;

export interface Schema {
  nonce: number;
  authority: PublicKey;
  collateral: TokenAccountBalance;
  isBeingLiquidated: boolean;
}

export default class Margin extends BaseAccount<Schema> {
  static async init(
    connection: Connection,
    wallet: any,
    opts: ConfirmOptions = { commitment: "finalized" },
    pid?: PublicKey,
  ): Promise<Margin> {
    const provider = new Provider(connection, wallet, {
      skipPreflight: SKIP_PREFLIGHT,
      ...opts,
    });
    const program = new Program(
      IDL_MARGIN,
      pid ?? ZERO_ONE_MARGIN_PROGRAM_ID,
      provider,
    );

    const [key, nonce] = await PublicKey.findProgramAddress(
      [
        program.provider.wallet.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode("marginv1"),
      ],
      program.programId,
    );

    await program.rpc.initMargin!(nonce, {
      accounts: {
        authority: program.provider.wallet.publicKey,
        margin: key,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
    });
    await sleep(2500);
    return await Margin.load(
      program.provider.wallet.publicKey,
      connection,
      wallet,
      opts,
      pid,
    );
  }

  static async load(
    traderKey: PublicKey,
    connection: Connection,
    wallet: any,
    opts?: ConfirmOptions,
    pid?: PublicKey,
  ): Promise<Margin> {
    const provider = new Provider(connection, wallet, {
      skipPreflight: SKIP_PREFLIGHT,
      ...opts,
    });
    const program = new Program(
      IDL_MARGIN,
      pid ?? ZERO_ONE_MARGIN_PROGRAM_ID,
      provider,
    );

    const [key, _nonce] = await PublicKey.findProgramAddress(
      [traderKey.toBuffer(), anchor.utils.bytes.utf8.encode("marginv1")],
      program.programId,
    );

    const client = program.account.margin!;
    let data = Margin.processData(await client.fetch(key));
    return new this(key, program, client, data as Schema);
  }

  private static processData(data: any): Schema {
    return {
      ...data,
      collateral: new TokenAccountBalance(data.collateral, NUM_DECIMALS),
    };
  }

  async refresh(): Promise<void> {
    this.data = Margin.processData(await this.accountClient.fetch(this.pubKey));
  }

  async deposit(
    amount: BN,
    tokenAccount: PublicKey,
    state: State,
  ): Promise<void> {
    await this.program.rpc.deposit!(amount, {
      accounts: {
        authority: this.wallet.publicKey,
        margin: this.pubKey,
        tokenAccount,
        state: state.pubKey,
        vault: state.data.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    await this.refresh();
  }

  async withdraw(
    amount: BN,
    tokenAccount: PublicKey,
    state: State,
    everMarket: EverlastingMarket,
    everOrder: EverlastingOrder,
  ): Promise<void> {

    await this.program.rpc.withdraw!(amount, {
      accounts: {
        authority: this.wallet.publicKey,
        margin: this.pubKey,
        tokenAccount,
        state: state.pubKey,
        vault: state.data.vault,
        tokenProgram: TOKEN_PROGRAM_ID,
        everMarket: everMarket.pubKey,
        everOrder: everOrder.pubKey,
        openOrders: everOrder.data.openOrders,
        dexMarket: everMarket.data.dexMarket,
        marketBids: everMarket.dexMarketAcc.bidsAddress,
        marketAsks: everMarket.dexMarketAcc.asksAddress,
        dexProgram: DEX_PROGRAM_ID
      },
    });

    await this.refresh();
  }
}
