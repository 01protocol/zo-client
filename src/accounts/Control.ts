import { AccountInfo, Commitment, PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import BaseAccount from "./BaseAccount";
import { ControlSchema, ControlSchema as Schema, Zo } from "../types";
import EventEmitter from "eventemitter3";
import { UpdateEvents } from "./margin/UpdateEvents";

/**
 * The Control account tracks a user's open orders and positions across all markets.
 */
export default class Control extends BaseAccount<Schema> {

  private constructor(
    program: Program<Zo>,
    pubkey: PublicKey,
    data: ControlSchema,
    public readonly commitment = "processed" as Commitment,
  ) {
    super(program, pubkey, data);
  }

  /**
   * Loads a new Control object from its public key.
   * @param program
   * @param k The control account's public key.
   * @param commitment
   */
  static async load(program: Program<Zo>, k: PublicKey, commitment = "processed" as Commitment) {
    return new this(program, k, await Control.fetch(program, k, commitment), commitment);
  }

  /**
   * Loads a new Control from existing data
   * @param program
   * @param k The control account's public key.
   * @param prefetchedControlData
   */
  static async loadPrefetched(
    program: Program<Zo>,
    k: PublicKey,
    prefetchedControlData: ControlSchema,
  ) {
    return new this(program, k, prefetchedControlData);
  }

  private static async fetch(
    program: Program<Zo>,
    k: PublicKey,
    commitment: Commitment
  ): Promise<Schema> {
    const data = (await program.account["control"].fetch(
      k,
      commitment,
    )) as unknown as Schema;
    return {
      ...data,
    };
  }

  private async _subscribe(
  ): Promise<EventEmitter> {
    return (await this.program.account["control"].subscribe(
      this.pubkey,
      this.commitment,
    ));
  }

  eventEmitter: EventEmitter<UpdateEvents> | undefined;
  async subscribe(): Promise<void> {
    this.eventEmitter = new EventEmitter()
    const anchorEventEmitter = await this._subscribe();
    const that = this
    anchorEventEmitter.addListener("change", (account) => {
      that.data = account
      this.eventEmitter!.emit(UpdateEvents.controlModified);
    });
  }

  async unsubscribe(){
    try {
      await this.program.account["control"].unsubscribe(
        this.pubkey,
      );
    } catch (_) {
      //
    }
  }

  async refresh(): Promise<void> {
    this.data = await Control.fetch(this.program, this.pubkey, this.commitment);
  }


  updateControlFromAccountInfo(accountInfo: AccountInfo<Buffer>) {
    this.data = this.program.coder.accounts.decode("control", accountInfo.data);
  }
}
