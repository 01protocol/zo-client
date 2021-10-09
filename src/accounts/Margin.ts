import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import BaseAccount from "./BaseAccount";
import TokenAccountBalance from "../utils/TokenAccountBalance";
import State from "./State";
import { DEX_PROGRAM_ID } from "../config";
import { sleep } from "../utils";
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
  static async init(): Promise<Margin> {
    const [key, nonce] = await PublicKey.findProgramAddress(
      [this.wallet.publicKey.toBuffer(), Buffer.from("marginv1")],
      this.program.programId,
    );

    this.connection.confirmTransaction(
      await this.program.rpc.initMargin!(nonce, {
        accounts: {
          authority: this.program.provider.wallet.publicKey,
          margin: key,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
      }),
    );
    return await Margin.load(this.program.provider.wallet.publicKey);
  }

  static async load(traderKey?: PublicKey): Promise<Margin> {
    traderKey = traderKey ?? this.wallet.publicKey;

    const clientName = "margin";
    const [key, _nonce] = await PublicKey.findProgramAddress(
      [traderKey.toBuffer(), anchor.utils.bytes.utf8.encode("marginv1")],
      this.program.programId,
    );

    let data = this.processData(
      await this.program.account[clientName]!.fetch(key),
    );
    return new this(key, clientName, data as Schema);
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
        marketBids: everMarket.dexMarket.bidsAddress,
        marketAsks: everMarket.dexMarket.asksAddress,
        dexProgram: DEX_PROGRAM_ID,
      },
    });

    await this.refresh();
  }
}
