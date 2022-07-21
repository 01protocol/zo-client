import { AccountInfo, Commitment, PublicKey } from "@solana/web3.js"
import { Program } from "@project-serum/anchor"
import BaseAccount from "./BaseAccount"
import {
	ChangeEvent,
	ControlSchema,
	ControlSchema as Schema,
	UpdateEvents,
	Zo,
} from "../types"
import EventEmitter from "eventemitter3"

/**
 * The Control account tracks a user's open orders and positions across all markets.
 */
export default class Control extends BaseAccount<Schema> {
	private constructor(
		program: Program<Zo>,
		pubkey: PublicKey,
		data: ControlSchema,
		commitment?: Commitment,
	) {
		super(program, pubkey, data, commitment)
	}

	/**
	 * Loads a new Control object from its public key.
	 * @param program
	 * @param k The control account's public key.
	 * @param commitment
	 */
	static async load(
		program: Program<Zo>,
		k: PublicKey,
		commitment = "processed" as Commitment,
	) {
		return new this(
			program,
			k,
			await Control.fetch(program, k, commitment),
			commitment,
		)
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
		return new this(program, k, prefetchedControlData)
	}

	private static async fetch(
		program: Program<Zo>,
		k: PublicKey,
		commitment: Commitment,
	): Promise<Schema> {
		const data = (await program.account["control"].fetch(
			k,
			commitment,
		)) as unknown as Schema
		return {
			...data,
		}
	}

	eventEmitter: EventEmitter<UpdateEvents, ChangeEvent<any>> | null = null

	/**
	 *
	 * @param withBackup - use a backup `confirmed` listener
	 */
	async subscribe(withBackup = false): Promise<void> {
		await this.subLock.waitAndLock()
		if (this.eventEmitter) return
		this.eventEmitter = new EventEmitter()
		const anchorEventEmitter = await this._subscribe("control", withBackup)
		const that = this
		anchorEventEmitter.addListener("change", (account) => {
			that.data = account
			this.eventEmitter!.emit(UpdateEvents.controlModified, [])
		})
		this.subLock.unlock()
	}

	async unsubscribe() {
		await this.subLock.waitAndLock()
		try {
			await this.program.account["control"].unsubscribe(this.pubkey)
			this.eventEmitter!.removeAllListeners()
			this.eventEmitter = null
		} catch (_) {
			//
		}
		this.subLock.unlock()
	}

	async refresh(): Promise<void> {
		this.data = await Control.fetch(
			this.program,
			this.pubkey,
			this.commitment,
		)
	}

	updateControlFromAccountInfo(accountInfo: AccountInfo<Buffer>) {
		this.data = this.program.coder.accounts.decode(
			"control",
			accountInfo.data,
		)
	}
}
