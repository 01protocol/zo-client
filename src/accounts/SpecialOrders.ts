import { PublicKey } from "@solana/web3.js"
import { Program } from "@project-serum/anchor"
import BaseAccount from "./BaseAccount"
import { SpecialOrdersSchema as Schema, Zo } from "../types"
import State from "./State"

/**
 * The SpecialOrders account tracks a user's trigger orders.
 */
export default class SpecialOrders extends BaseAccount<Schema> {
	private static process(data: any) {
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
		let data = await SpecialOrders.fetchNullable(program, k)

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
}
