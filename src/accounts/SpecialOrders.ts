import { PublicKey } from "@solana/web3.js"
import { Program } from "@project-serum/anchor"
import BaseAccount from "./BaseAccount"
import { ChangeEvent, SpecialOrdersSchema as Schema, UpdateEvents, Zo } from "../types"
import State from "./State"
import EventEmitter from "eventemitter3"

/**
 * The SpecialOrders account tracks a user's trigger orders.
 */
export default class SpecialOrders extends BaseAccount<Schema> {
	private static process(data: Schema) {
		return {
			...data,
			entries: data.entries.filter((x: any) => x.id != 0),
		}
	}

	private static async fetch(
		program: Program<Zo>,
		k: PublicKey,
	): Promise<Schema> {
		const data = (await program.account["specialOrders"].fetch(
			k,
			"recent",
		)) as unknown as Schema
		return SpecialOrders.process(data)
	}

	private static async fetchNullable(
		program: Program<Zo>,
		k: PublicKey,
	): Promise<Schema | null> {
		const data = (await program.account["specialOrders"].fetchNullable(
			k,
			"recent",
		)) as unknown as Schema | null
		return data && SpecialOrders.process(data)
	}

	static async getPda(
		st: State,
		authority: PublicKey,
		programId: PublicKey,
	): Promise<PublicKey> {
		return (
			await PublicKey.findProgramAddress(
				[
					authority.toBuffer(),
					st.pubkey.toBuffer(),
					Buffer.from("sordersv1"),
				],
				programId,
			)
		)[0]
	}

	/**
	 * Loads a new SpecialOrders object from its public key. If the account
	 * doesn't exist, `null` is returned.
	 * @param program
	 * @param k The special orders account's public key.
	 */
	static async loadNullable(
		program: Program<Zo>,
		k: PublicKey,
	): Promise<SpecialOrders | null> {
		const data = await SpecialOrders.fetchNullable(program, k)

		if (data === null) return null
		else return new this(program, k, data)
	}

	/**
	 * Load from existing data.
	 * @param program
	 * @param k The account's public key.
	 * @param data
	 */
	static async loadPrefetched(
		program: Program<Zo>,
		k: PublicKey,
		data: Schema,
	) {
		return new this(program, k, SpecialOrders.process(data))
	}

	async refresh(): Promise<void> {
		this.data = await SpecialOrders.fetch(this.program, this.pubkey)
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
		const anchorEventEmitter = await this._subscribe("specialOrders", withBackup)
		const that = this
		anchorEventEmitter.addListener("change", (account) => {
			that.data = SpecialOrders.process(account)
			this.eventEmitter!.emit(UpdateEvents.specialOrdersUpdated, [])
		})
		this.subLock.unlock()
	}

	async unsubscribe() {
		await this.subLock.waitAndLock()
		try {
			await this._unsubscribe()
			this.eventEmitter!.removeAllListeners()
			this.eventEmitter = null
		} catch (_) {
			//
		}
		this.subLock.unlock()
	}
}
