import { Commitment, PublicKey } from "@solana/web3.js"
import { BN, Program } from "@project-serum/anchor"
import Decimal from "decimal.js"
import BaseAccount from "./BaseAccount"
import { Schema as StateSchema } from "./State"
import Num from "../Num"
import { CacheSchema, ChangeEvent, UpdateEvents, Zo } from "../types"
import { loadSymbol, loadWI80F48 } from "../utils"
import EventEmitter from "eventemitter3"

type OracleCache = Omit<
	CacheSchema["oracles"][0],
	"symbol" | "price" | "twap"
> & {
	symbol: string
	price: Num
	twap: Num
}

type MarkCache = Omit<CacheSchema["marks"][0], "price" | "twap"> & {
	price: Num
	twap: {
		cumulAvg: Num
		open: Num
		low: Num
		high: Num
		close: Num
		lastSampleStartTime: Date
	}
}

type BorrowCache = Omit<
	CacheSchema["borrowCache"][0],
	"supply" | "borrows" | "supplyMultiplier" | "borrowMultiplier"
> & {
	rawSupply: Decimal
	rawBorrows: Decimal
	actualSupply: Num
	actualBorrows: Num
	supplyMultiplier: Decimal
	borrowMultiplier: Decimal
}

type Schema = Omit<CacheSchema, "oracles" | "marks" | "borrowCache"> & {
	oracles: OracleCache[]
	marks: MarkCache[]
	borrowCache: BorrowCache[]
}

/**
 * The Cache account stores and tracks oracle prices, mark prices, funding and borrow lending multipliers.
 */
export default class Cache extends BaseAccount<Schema> {
	eventEmitter: EventEmitter<UpdateEvents, ChangeEvent<any>> | null = null

	private constructor(
		program: Program<Zo>,
		k: PublicKey,
		data: Schema,
		private _st: StateSchema,
		commitment?: Commitment,
	) {
		super(program, k, data, commitment)
	}

	/**
	 * Loads a new Cache object from its public key.
	 * @param program
	 * @param k The cache account's public key.
	 * @param st
	 * @param commitment
	 */
	static async load(
		program: Program<Zo>,
		k: PublicKey,
		st: StateSchema,
		commitment = "processed" as Commitment,
	) {
		return new this(
			program,
			k,
			await Cache.fetch(program, k, st, commitment),
			st,
			commitment,
		)
	}

	private static async fetch(
		program: Program<Zo>,
		k: PublicKey,
		st: StateSchema,
		commitment: Commitment,
	): Promise<Schema> {
		const data = (await program.account["cache"].fetch(
			k,
			commitment,
		)) as CacheSchema
		return Cache.processRawCacheData(data, st)
	}

	async updateState(st: StateSchema): Promise<void> {
		this._st = st
		this.data = Cache.processRawCacheData(
			// @ts-ignore
			this.data as CacheSchema,
			this._st,
		)
	}

	/**
	 *
	 * @param withBackup - use a backup `confirmed` listener
	 * @param subscribeLimit - minimum time difference between cache updates, to prevent constant reloads
	 */
	async subscribe(withBackup = false, subscribeLimit = 5000): Promise<void> {
		await this.subLock.waitAndLock()
		if (this.eventEmitter) return
		this.subscribeTimeLimit = subscribeLimit
		this.eventEmitter = new EventEmitter()
		const anchorEventEmitter = await this._subscribe("cache", withBackup)
		const that = this

		function processUpdate(account) {
			that.data = Cache.processRawCacheData(account, that._st)
			that.eventEmitter!.emit(UpdateEvents._cacheModified, [])
		}

		anchorEventEmitter.addListener(
			"change",
			this.updateAccountOnChange(processUpdate, this),
		)
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

	private static processRawCacheData(
		data: CacheSchema,
		st: StateSchema,
	): Schema {
		return {
			...data,
			oracles: data.oracles
				//@ts-ignore
				.filter((c) => !c.symbol.data.every((x) => x === 0))
				.map((c) => {
					const decimals = c.quoteDecimals - c.baseDecimals
					return {
						...c,
						//@ts-ignore
						symbol: loadSymbol(c.symbol),
						price: Num.fromWI80F48(c.price, decimals),
						twap: Num.fromWI80F48(c.twap, decimals),
					}
				}),
			marks: st.perpMarkets.map((m, i) => {
				const decimals = 6 - m.assetDecimals
				const c = data.marks[i]!
				return {
					...c,
					price: Num.fromWI80F48(c.price, decimals),
					twap: {
						cumulAvg: Num.fromWI80F48(c.twap.cumulAvg, 0),
						// deprecated
						open: Num.fromWI80F48(c.twap.open, decimals),
						// deprecated
						high: Num.fromWI80F48(c.twap.high, decimals),
						// deprecated
						low: Num.fromWI80F48(c.twap.low, decimals),
						// deprecated
						close: Num.fromWI80F48(c.twap.close, decimals),
						lastSampleStartTime: new Date(
							c.twap.lastSampleStartTime.toNumber() * 1000,
						),
					},
				}
			}),
			borrowCache: st.collaterals.map((col, i) => {
				const decimals = col.decimals
				const c = data.borrowCache[i]!
				const rawSupply = loadWI80F48(c.supply)
				const rawBorrows = loadWI80F48(c.borrows)
				const supplyMultiplier = loadWI80F48(c.supplyMultiplier)
				const borrowMultiplier = loadWI80F48(c.borrowMultiplier)
				return {
					...c,
					rawSupply,
					actualSupply: new Num(
						new BN(
							rawSupply
								.times(supplyMultiplier)
								.floor()
								.toString(),
						),
						decimals,
					),
					rawBorrows,
					actualBorrows: new Num(
						new BN(
							rawBorrows
								.times(borrowMultiplier)
								.ceil()
								.toString(),
						),
						decimals,
					),
					supplyMultiplier,
					borrowMultiplier,
				}
			}),
		}
	}

	async refresh(): Promise<void> {
		this.data = await Cache.fetch(
			this.program,
			this.pubkey,
			this._st,
			this.commitment,
		)
	}

	/**
	 * @param sym The collateral symbol. Ex: ("BTC")
	 * @returns The oracle cache for the given collateral.
	 */
	getOracleBySymbol(sym: string): OracleCache {
		const i = this.data.oracles.findIndex((x) => x.symbol === sym)
		if (i < 0) {
			throw RangeError(
				`Invalid symbol ${sym} for <Cache ${this.pubkey.toBase58()}>`,
			)
		}
		return this.data.oracles[i]!
	}
}
