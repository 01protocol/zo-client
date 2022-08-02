import { Commitment, PublicKey } from "@solana/web3.js"
import { BN, Program } from "@project-serum/anchor"
import Cache from "./Cache"
import { Orderbook, ZoMarket } from "../zoDex/zoMarket"
import { ChangeEvent, StateSchema, UpdateEvents, Zo } from "../types"
import { BASE_IMF_DIVIDER, MMF_MULTIPLIER, USD_DECIMALS } from "../config"
import { AssetInfo, FundingInfo, MarketInfo, MarketType } from "../types/dataTypes"
import Decimal from "decimal.js"
import _ from "lodash"
import Num from "../Num"
import { AsyncLock, loadSymbol } from "../utils"
import BaseAccount from "./BaseAccount"
import EventEmitter from "eventemitter3"
import { decodeEventQueue, Event } from "../zoDex/queue"
import { ChangeType, MarketFundingChange, MarketPriceChange, StateBalanceChange } from "../types/changeLog"

type CollateralInfo = Omit<StateSchema["collaterals"][0], "oracleSymbol"> & {
	oracleSymbol: string
}

type PerpMarket = Omit<
	StateSchema["perpMarkets"][0],
	"symbol" | "oracleSymbol"
> & {
	symbol: string
	oracleSymbol: string
}

export interface Schema
	extends Omit<StateSchema, "perpMarkets" | "collaterals"> {
	perpMarkets: PerpMarket[]
	collaterals: CollateralInfo[]
}

/**
 * The state account defines program-level parameters, and tracks listed markets and supported collaterals.
 */
export default class State extends BaseAccount<Schema> {
	/**
	 * zo market infos
	 */
	zoMarketAccounts: {
		[key: string]: {
			dexMarket: ZoMarket
			bids: Orderbook
			asks: Orderbook
			eventQueue: Event[]
		}
	} = {}
	assets: { [key: string]: AssetInfo } = {}
	markets: { [key: string]: MarketInfo } = {}

	private constructor(
		program: Program<Zo>,
		pubkey: PublicKey,
		data: Readonly<Schema>,
		public readonly signer: PublicKey,
		public readonly cache: Cache,
		commitment?: Commitment,
	) {
		super(program, pubkey, data, commitment)
	}

	/**
	 * map asset index to asset key
	 */
	get indexToAssetKey() {
		const index: string[] = []
		for (const collateral of this.data.collaterals) {
			index.push(collateral.oracleSymbol)
		}
		return index
	}

	/**
	 * map market index to market key
	 */
	get indexToMarketKey() {
		const index: string[] = []
		for (const perpMarket of this.data.perpMarkets) {
			index.push(perpMarket.symbol)
		}
		return index
	}

	/**
	 * Gets the state signer's pda account and bump.
	 * @returns An array consisting of the state signer pda and bump.
	 */
	static async getSigner(
		stateKey: PublicKey,
		programId: PublicKey,
	): Promise<[PublicKey, number]> {
		return await PublicKey.findProgramAddress(
			[stateKey.toBuffer()],
			programId,
		)
	}

	/**
	 * @param program
	 * @param k The state's public key.
	 * @param commitment
	 */
	static async load(
		program: Program<Zo>,
		k: PublicKey,
		commitment = "processed" as Commitment,
	): Promise<State> {
		const data = await this.fetch(program, k, commitment)
		const [signer, signerNonce] = await this.getSigner(k, program.programId)
		if (signerNonce !== data.signerNonce) {
			throw Error("Invalid state signer nonce")
		}
		const cache = await Cache.load(program, data.cache, data, commitment)
		const state = new this(program, k, data, signer, cache, commitment)
		state.loadAssets()
		state.loadMarkets()
		await state.loadZoMarkets()
		return state
	}

	private static async fetch(
		program: Program<Zo>,
		k: PublicKey,
		commitment: Commitment,
	): Promise<Schema> {
		const data = (await program.account["state"]!.fetch(
			k,
			commitment as Commitment,
		)) as StateSchema

		// Convert StateSchema to Schema.
		return State.processRawStateData(data)
	}

	static getEventQueueUpdateEventName(symbol: string) {
		return UpdateEvents.eventQueueModified + "-" + symbol
	}

	private static processRawStateData(data: StateSchema): Schema {
		return {
			...data,
			vaults: data.vaults.slice(0, data.totalCollaterals),
			collaterals: data.collaterals
				.slice(0, data.totalCollaterals)
				.map((x) => ({
					...x,
					// @ts-ignore
					oracleSymbol: loadSymbol(x.oracleSymbol),
				})),
			perpMarkets: data.perpMarkets
				.slice(0, data.totalMarkets)
				.map((x) => ({
					...x,
					// @ts-ignore
					symbol: loadSymbol(x.symbol),
					// @ts-ignore
					oracleSymbol: loadSymbol(x.oracleSymbol),
				})),
		}
	}

	/**
	 * computes supply and borrow apys
	 * @param utilization
	 * @param optimalUtility
	 * @param maxRate
	 * @param optimalRate
	 * @private
	 */
	private static computeSupplyAndBorrowApys(
		utilization: Decimal,
		optimalUtility: Decimal,
		maxRate: Decimal,
		optimalRate: Decimal,
	) {
		let ir
		if (utilization.mul(1000).greaterThan(optimalUtility)) {
			const extraUtil = utilization.mul(1000).sub(optimalUtility)
			const slope = maxRate
				.sub(optimalRate)
				.div(new Decimal(1000).sub(optimalUtility))
			ir = optimalRate.add(slope.mul(extraUtil)).div(1000)
		} else {
			ir = optimalRate.div(optimalUtility).mul(utilization)
		}
		const borrowApy = ir.mul(100)
		const supplyApy = ir.mul(utilization).mul(100)
		return { borrowApy, supplyApy }
	}

	async refresh(): Promise<void> {
		this.zoMarketAccounts = {}
		;[this.data] = await Promise.all([
			State.fetch(this.program, this.pubkey, this.commitment),
			this.cache.refresh(),
		])
		this.loadAssets()
		this.loadMarkets()
	}

	/**
	 * Get the index of the collateral in the State's collaterals list using the mint public key.
	 * @param mint The mint's public key.
	 */
	getCollateralIndex(mint: PublicKey): number {
		const i = this.data.collaterals.findIndex((x) => x.mint.equals(mint))
		if (i < 0) {
			throw RangeError(
				`Invalid mint ${mint.toBase58()} for <State ${this.pubkey.toBase58()}>`,
			)
		}
		return i
	}

	getMintBySymbol(symbol: string): PublicKey {
		const i = this.data.collaterals.findIndex(
			(x) => x.oracleSymbol === symbol,
		)
		if (i < 0) {
			throw RangeError(
				`Invalid symbol ${symbol} for <State ${this.pubkey.toBase58()}>`,
			)
		}
		return this.data.collaterals[i]!.mint
	}

	/**
	 * Get the vault public key and the CollateralInfo object for a collateral using the mint public key.
	 * @param mint The mint's public key.
	 * @returns The vault public key and the CollateralInfo object.
	 */
	getVaultCollateralByMint(
		mint: PublicKey,
	): [PublicKey, Schema["collaterals"][0]] {
		const i = this.getCollateralIndex(mint)
		return [
			this.data.vaults[i] as PublicKey,
			this.data.collaterals[i] as Schema["collaterals"][0],
		]
	}

	/**
	 * Get the index of a market in the State's PerpMarkets list using the market symbol.
	 * @param sym The market symbol. Ex:("BTC-PERP")
	 */
	getMarketIndexBySymbol(sym: string): number {
		const i = this.data.perpMarkets.findIndex((x) => x.symbol === sym)
		if (i < 0) {
			throw RangeError(
				`Invalid symbol ${sym} for <State ${this.pubkey.toBase58()}>`,
			)
		}
		return i
	}

	getMarketKeyBySymbol(sym: string): PublicKey {
		return this.data.perpMarkets[this.getMarketIndexBySymbol(sym)]
			?.dexMarket as PublicKey
	}

	async getMarketBySymbol(
		sym: string,
		withOrderbooks?: boolean,
		withEventQueues?: boolean,
	): Promise<ZoMarket> {
		if (!this.zoMarketAccounts[sym]) {
			await this.getZoMarketAccounts({
				market: this.markets[sym]!,
				withOrderbooks,
				withEventQueues,
			})
		}
		return this.zoMarketAccounts[sym]!.dexMarket
	}

	/* -------------------------------------------------------------------------- */
	/*                                                                            */
	/*                                Data stuff below                            */
	/*                                                                            */

	/* -------------------------------------------------------------------------- */

	/**
	 * Called by the keepers every hour to update the funding on each market.
	 * @param symbol The market symbol. Ex:("BTC-PERP")
	 */
	async updatePerpFunding(symbol: string) {
		const market = await this.getMarketBySymbol(symbol)
		return await this.program.rpc.updatePerpFunding({
			accounts: {
				state: this.pubkey,
				stateSigner: this.signer,
				cache: this.cache.pubkey,
				dexMarket: market.address,
				marketBids: market.bidsAddress,
				marketAsks: market.asksAddress,
				dexProgram: this.getDexProgram(),
			},
		})
	}

	/**
	 * Called by the keepers regularly to cache the oracle prices.
	 * @param mockPrices Only used for testing purposes. An array of user-set prices.
	 */
	async cacheOracle(mockPrices?: BN[]) {
		const oracles = this.cache.data.oracles
		return await this.program.rpc.cacheOracle(
			oracles.map((x) => x.symbol),
			mockPrices ?? null,
			{
				accounts: {
					signer: this.publicKey,
					state: this.pubkey,
					cache: this.cache.pubkey,
					dexProgram: this.getDexProgram(),
				},
				remainingAccounts: [
					...oracles
						.flatMap((x) => x.sources)
						.map((x) => ({
							isSigner: false,
							isWritable: false,
							pubkey: x.key,
						})),
					...this.data.perpMarkets.map((x) => ({
						isSigner: false,
						isWritable: false,
						pubkey: x.dexMarket,
					})),
				],
			},
		)
	}

	/**
	 * Called by the keepers to update the borrow and supply multipliers.
	 * @param start The inclusive start index of the collateral array.
	 * @param end The exclusive end index of the collateral array.
	 */
	async cacheInterestRates(start: number, end: number) {
		return await this.program.rpc.cacheInterestRates(start, end, {
			accounts: {
				signer: this.publicKey,
				state: this.pubkey,
				cache: this.data.cache,
			},
		})
	}

	/**
	 * Get the ZoMarket DEX accounts for a market using the market object (  { dexMarket: ZoMarket; bids: Orderbook; asks: Orderbook } )
	 * @param market
	 * @param withOrderbooks parameter to fetch asks and bids, default = true due to previous versions
	 * @param withEventQueues to fetch eventqueue or no
	 */
	async getZoMarketAccounts({
		market,
		withOrderbooks = true,
		withEventQueues,
	}: {
		market: MarketInfo
		withOrderbooks?: boolean
		withEventQueues?: boolean
	}) {
		if (this.zoMarketAccounts[market.symbol]) {
			let fetchedAlready = true
			if (
				withOrderbooks &&
				this.zoMarketAccounts[market.symbol]!.asks == null
			) {
				fetchedAlready = false
			}
			if (
				withEventQueues &&
				this.zoMarketAccounts[market.symbol]!.eventQueue == null
			) {
				fetchedAlready = false
			}
			if (fetchedAlready) {
				return this.zoMarketAccounts[market.symbol]!
			}
		}
		const dexMarket = await ZoMarket.load(
			this.program.provider.connection,
			market.pubKey,
			{ commitment: this.commitment },
			this.getDexProgram(),
		)
		let bids, asks, eventQueue
		const promises: Array<Promise<boolean>> = []
		if (withOrderbooks) {
			promises.push(
				new Promise(async (res) => {
					bids = await dexMarket.loadBids(
						this.program.provider.connection,
						this.commitment,
					)
					res(true)
				}),
			)
			promises.push(
				new Promise(async (res) => {
					asks = await dexMarket.loadAsks(
						this.program.provider.connection,
						this.commitment,
					)
					res(true)
				}),
			)
		}
		if (withEventQueues) {
			promises.push(
				new Promise(async (res) => {
					eventQueue = await dexMarket.loadEventQueue(
						this.program.provider.connection,
						this.commitment,
					)
					res(true)
				}),
			)
		}
		await Promise.all(promises)
		this.zoMarketAccounts[market.symbol] = {
			dexMarket,
			bids,
			asks,
			eventQueue,
		}
		return this.zoMarketAccounts[market.symbol]!
	}

	/**
	 * Load all ZoMarket DEX Accounts
	 */
	async loadZoMarkets(withOrderbooks?: boolean, withEventQueues?: boolean) {
		const promises: Array<Promise<boolean>> = []
		for (const marketInfo of Object.values(this.markets)) {
			promises.push(
				new Promise(async (res) => {
					await this.getZoMarketAccounts({
						market: marketInfo,
						withOrderbooks,
						withEventQueues,
					})
					res(true)
				}),
			)
		}
		await Promise.all(promises)
	}

	/**
	 * Load all assets
	 */
	loadAssets(): Array<StateBalanceChange> {
		const changeLog: Array<StateBalanceChange> = []
		const assets: { [key: string]: AssetInfo } = {}
		let index = 0

		for (const collateral of this.data.collaterals) {
			const supply =
				this.cache.data.borrowCache[index]!.actualSupply.decimal
			const borrows =
				this.cache.data.borrowCache[index]!.actualBorrows.decimal
			const utilization = supply.greaterThan(new Decimal(0))
				? borrows.div(supply)
				: new Decimal(0)
			const optimalUtility = new Decimal(
				collateral.optimalUtil.toString(),
			)
			const optimalRate = new Decimal(collateral.optimalRate.toString())
			const maxRate = new Decimal(collateral.maxRate.toString())
			const { borrowApy, supplyApy } = State.computeSupplyAndBorrowApys(
				utilization,
				optimalUtility,
				maxRate,
				optimalRate,
			)
			const symbol = collateral.oracleSymbol
			const price = this.cache.getOracleBySymbol(symbol).price

			// @ts-ignore
			assets[symbol] = {
				...collateral,
				symbol: symbol,
				indexPrice: price,
				vault: this.data.vaults[index]!,
				supply: this.cache.data.borrowCache[index]!.actualSupply
					.decimal,
				borrows:
					this.cache.data.borrowCache[index]!.actualBorrows.decimal,
				supplyApy: supplyApy.toNumber(),
				borrowsApy: borrowApy.toNumber(),
				rawSupply: this.cache.data.borrowCache[index]!.rawSupply,
				rawBorrows: this.cache.data.borrowCache[index]!.rawBorrows,
				maxDeposit: new Num(collateral.maxDeposit, collateral.decimals)
					.decimal,
				dustThreshold: new Num(
					collateral.dustThreshold,
					collateral.decimals,
				),
			}
			this.processAssetChangeLog(symbol, assets, changeLog)

			index++
		}
		this.assets = assets
		return changeLog
	}

	private processAssetChangeLog(
		symbol: string,
		assets: { [p: string]: AssetInfo },
		changeLog: Array<StateBalanceChange>,
	) {
		if (this.assets[symbol]) {
			const prev = this.assets[symbol]!
			const curr = assets[symbol]!
			if (
				!prev.rawSupply.eq(curr.rawSupply) ||
				!prev.rawBorrows.eq(curr.rawBorrows)
			) {
				const change: StateBalanceChange = {
					prev: {
						supply: prev.supply,
						borrows: prev.borrows,
						key: prev.symbol,
					},
					curr: {
						supply: curr.supply,
						borrows: curr.borrows,
						key: curr.symbol,
					},
					type: ChangeType.StateBalanceChange,
					time: new Date(),
				}
				changeLog.push(change)
			}
		}
	}

	/**
	 * gets market type
	 * @param perpType
	 */
	_getMarketType(perpType) {
		if (_.isEqual(perpType, { future: {} })) {
			return MarketType.Perp
		} else if (_.isEqual(perpType, { callOption: {} })) {
			return MarketType.EverCall
		} else if (_.isEqual(perpType, { putOption: {} })) {
			return MarketType.EverPut
		} else if (_.isEqual(perpType, { square: {} })) {
			return MarketType.SquaredPerp
		}
		return MarketType.Perp
	}

	/**
	 * Load all market infos
	 */
	loadMarkets(): Array<MarketPriceChange | MarketFundingChange> {
		const changeLog: Array<MarketPriceChange | MarketFundingChange> = []
		const markets: { [key: string]: MarketInfo } = {}
		let index = 0
		for (const perpMarket of this.data.perpMarkets) {
			const marketType = this._getMarketType(perpMarket.perpType)
			let price = this.cache.getOracleBySymbol(
				perpMarket.oracleSymbol,
			).price
			const oracle = this.cache.getOracleBySymbol(perpMarket.oracleSymbol)
			let indexTwap = oracle.twap
			const mark = this.cache.data.marks[index]!
			const num5MinIntervalsSinceLastTwapStartTime = Math.floor(
				mark.twap.lastSampleStartTime.getMinutes() / 5,
			)
			const markPrice = this.cache.data.marks[index]!.price
			let markTwap
			if (num5MinIntervalsSinceLastTwapStartTime == 0) {
				markTwap = markPrice
			} else {
				markTwap = new Num(
					mark.twap.cumulAvg.decimal
						.div(num5MinIntervalsSinceLastTwapStartTime)
						.div(4),
					perpMarket.assetDecimals,
				)
			}
			if (marketType === MarketType.SquaredPerp) {
				price = price.raiseToPower(2)
				price = price.divN(perpMarket.strike)
				indexTwap = indexTwap.raiseToPower(2)
				indexTwap = indexTwap.divN(perpMarket.strike)
			}
			const symbol = perpMarket.symbol
			markets[symbol] = {
				symbol: symbol,
				pubKey: perpMarket.dexMarket,
				//todo:  price adjustment for powers and evers
				indexPrice: price,
				indexTwap: indexTwap,
				markTwap: markTwap,
				markPrice: markPrice,
				baseImf: new Decimal(perpMarket.baseImf / BASE_IMF_DIVIDER),
				pmmf: new Decimal(
					perpMarket.baseImf / BASE_IMF_DIVIDER / MMF_MULTIPLIER,
				),
				fundingIndex: new Num(
					this.cache.data.fundingCache[index]!,
					USD_DECIMALS,
				).decimal,
				marketType: marketType,
				assetDecimals: perpMarket.assetDecimals,
				assetLotSize: Math.round(
					Math.log(new Num(perpMarket.assetLotSize, 0).number) /
						Math.log(10),
				),
				quoteLotSize: Math.round(
					Math.log(new Num(perpMarket.quoteLotSize, 0).number) /
						Math.log(10),
				),
				strike: new Num(perpMarket.strike, USD_DECIMALS).number,
			}
			this.processMarketChangeLog(symbol, markets, changeLog)
			index++
		}
		this.markets = markets
		return changeLog
	}

	private processMarketChangeLog(
		symbol: string,
		markets: { [p: string]: MarketInfo },
		changeLog: Array<MarketPriceChange | MarketFundingChange>,
	) {
		if (this.markets[symbol]) {
			const prev = this.markets[symbol]!
			const curr = markets[symbol]!
			if (
				!prev.indexPrice.decimal.eq(curr.indexPrice.decimal) ||
				!prev.markPrice.decimal.eq(curr.markPrice.decimal)
			) {
				const change: MarketPriceChange = {
					prev: {
						indexPrice: prev.indexPrice.decimal,
						markPrice: prev.markPrice.decimal,
						key: prev.symbol,
					},
					curr: {
						indexPrice: curr.indexPrice.decimal,
						markPrice: curr.markPrice.decimal,
						key: prev.symbol,
					},
					type: ChangeType.MarketPriceChange,
					time: new Date(),
				}
				changeLog.push(change)
			}
			if (!prev.fundingIndex.eq(curr.fundingIndex)) {
				const change: MarketFundingChange = {
					prev: {
						fundingIndex: prev.fundingIndex,
						key: prev.symbol,
					},
					curr: {
						fundingIndex: curr.fundingIndex,
						key: prev.symbol,
					},
					type: ChangeType.MarketFundingChange,
					time: new Date(),
				}
				changeLog.push(change)
			}
		}
	}

	/**
	 * Gets the funding info object for a given market.
	 * Funding will be undefined in the first minute of the hour.
	 * Make sure to handle that case!
	 */
	getFundingInfo(symbol: string): FundingInfo {
		const marketIndex = this.getMarketIndexBySymbol(symbol)
		const lastSampleStartTime =
			this.cache.data.marks[marketIndex]!.twap.lastSampleStartTime
		const cumulAvg =
			this.cache.data.marks[marketIndex]!.twap.cumulAvg.decimal
		const hasData =
			cumulAvg.abs().gt(0) && lastSampleStartTime.getMinutes() > 0
		return {
			data: hasData
				? {
					hourly: cumulAvg.div(
						lastSampleStartTime.getMinutes() * 24,
					),
					daily: cumulAvg.div(lastSampleStartTime.getMinutes()),
					apr: cumulAvg
						.div(lastSampleStartTime.getMinutes())
						.times(100)
						.times(365),
				  }
				: null,
			lastSampleUpdate: lastSampleStartTime,
		}
	}

	getBestAsk(marketKey: string) {
		const firstAsk = this.zoMarketAccounts[marketKey]!.asks.getL2(1)[0]
		if (firstAsk) return firstAsk[0]
		return 1_000_000_000
	}

	getBestBid(marketKey: string) {
		const firstBid = this.zoMarketAccounts[marketKey]!.bids.getL2(1)[0]
		if (firstBid) return firstBid[0]
		return 0
	}

	getMarketImf(marketKey: string): Decimal {
		return this.getMarketMmf(marketKey).mul(2)
	}

	getMarketMmf(marketKey: string): Decimal {
		return this.markets[marketKey]!.pmmf
	}

	static getOrderbookUpdateEventName(symbol: string) {
		return UpdateEvents.orderbookModified + "-" + symbol
	}

	/**
	 * Subscriptions
	 */

	eventEmitter: EventEmitter<UpdateEvents, ChangeEvent<any>> | null = null

	subscribeLastUpdate = new Date().getTime()
	subscribeTimeLimit = 0

	/**
	 *
	 * @param withBackup - use a backup `confirmed` listener
	 * @param subscribeLimit - minimum time difference between state updates, to prevent constant reloads
	 * @param cacheLimit - minimum time difference between cache updates, to prevent constant reloads
	 */
	async subscribe(
		withBackup = false,
		subscribeLimit = 1000,
		cacheLimit = 5000,
	) {
		await this.subLock.waitAndLock()
		if (this.eventEmitter) return
		this.subscribeTimeLimit = subscribeLimit
		this.eventEmitter = new EventEmitter()
		const anchorEventEmitter = await this._subscribe("state", withBackup)
		const that = this

		function processUpdate(account) {
			that.data = State.processRawStateData(account)
			const changeLog = [...that.loadAssets(), ...that.loadMarkets()]
			if (changeLog.length > 0) {
				that.eventEmitter!.emit(UpdateEvents.stateModified, changeLog)
			}
		}

		anchorEventEmitter.addListener(
			"change",
			this.updateAccountOnChange(processUpdate, this),
		)
		await this.cache.subscribe(withBackup, cacheLimit)
		this.cache.eventEmitter!.addListener(
			UpdateEvents._cacheModified,
			(data) => {
				const changeLog = [
					...data,
					...that.loadAssets(),
					...that.loadMarkets(),
				]
				this.eventEmitter!.emit(UpdateEvents._cacheModified, changeLog)
			},
		)
		this.subLock.unlock()
	}

	async unsubscribe() {
		await this.subLock.waitAndLock()
		try {
			await this.program.account["state"]!.unsubscribe(this.pubkey)
			this.eventEmitter!.removeAllListeners()
			await this.cache.unsubscribe()
			this.eventEmitter = null
		} catch (_) {
			//
		}
		this.subLock.unlock()
	}

	/**
	 * OB listeners
	 */

	_obEmitters: { [key: string]: EventEmitter<string, any> } = {}
	_obEmittersKeys: { [key: string]: number } = {}
	_obEmittersLocks: { [key: string]: AsyncLock } = {}

	obEmitter(symbol: string) {
		return this._obEmitters[symbol]
	}

	async subscribeToOrderbook(symbol: string) {
		if (this._obEmittersLocks[symbol]) {
			await this._obEmittersLocks[symbol]!.waitAndLock()
		} else {
			this._obEmittersLocks[symbol] = new AsyncLock()
			await this._obEmittersLocks[symbol]!.waitAndLock()
		}
		if (this._obEmitters[symbol]) return
		this._obEmitters[symbol] = new EventEmitter()
		const { dexMarket } = await this.getZoMarketAccounts({
			market: this.markets[symbol]!,
			withOrderbooks: true,
			withEventQueues: false,
		})
		const marketPubKey = dexMarket.publicKey
		this._obEmittersKeys[symbol] = this.connection.onAccountChange(
			marketPubKey,
			async (zoMarketBuffer) => {
				const zoMarket = await ZoMarket.load(
					this.provider.connection,
					marketPubKey,
					{ commitment: this.commitment },
					this.getDexProgram(),
					zoMarketBuffer,
				)
				let bidsOrderbook, asksOrderbook
				const promises: Array<Promise<boolean>> = []
				promises.push(
					new Promise(async (res) => {
						bidsOrderbook = await zoMarket.loadBids(
							this.provider.connection,
							this.commitment,
						)
						res(true)
					}),
				)
				promises.push(
					new Promise(async (res) => {
						asksOrderbook = await zoMarket.loadAsks(
							this.provider.connection,
							this.commitment,
						)
						res(true)
					}),
				)
				await Promise.all(promises)
				this.zoMarketAccounts[symbol]!.bids = bidsOrderbook
				this.zoMarketAccounts[symbol]!.asks = asksOrderbook
				if (this._obEmitters[symbol]) {
					this._obEmitters[symbol]!.emit(
						State.getOrderbookUpdateEventName(symbol),
						{
							bidsOrderbook: bidsOrderbook,
							asksOrderbook: asksOrderbook,
						},
					)
				}
			},
			this.commitment,
		)
		this._obEmittersLocks[symbol]!.unlock()
	}

	async unsubscribeFromOrderbook(symbol: string) {
		if (this._obEmittersLocks[symbol]) {
			await this._obEmittersLocks[symbol]!.waitAndLock()
		} else {
			this._obEmittersLocks[symbol] = new AsyncLock()
			await this._obEmittersLocks[symbol]!.waitAndLock()
		}
		try {
			if (this._obEmittersKeys[symbol]) {
				this.connection
					.removeAccountChangeListener(this._obEmittersKeys[symbol]!)
					.then()

				this.eventEmitter!.removeAllListeners()
				delete this._obEmittersKeys[symbol]
				delete this._obEmitters[symbol]
			}
		} catch (_) {
			//
		}
		this._obEmittersLocks[symbol]!.unlock()
	}

	async subscribeToAllOrderbooks() {
		const promises: Array<Promise<boolean>> = []
		for (const symbol of Object.keys(this.markets)) {
			promises.push(
				new Promise(async (res) => {
					await this.subscribeToOrderbook(symbol)
					res(true)
				}),
			)
		}
		await Promise.all(promises)
	}

	async unsubscribeFromAllOrderbooks() {
		const promises: Array<Promise<boolean>> = []
		for (const symbol of Object.keys(this.markets)) {
			promises.push(
				new Promise(async (res) => {
					await this.unsubscribeFromOrderbook(symbol)
					res(true)
				}),
			)
		}
		await Promise.all(promises)
	}

	/**
	 * Event Queue listeners
	 */

	_eqEmitters: { [key: string]: EventEmitter<string, any> } = {}
	_eqEmittersKeys: { [key: string]: number } = {}
	_eqEmittersLocks: { [key: string]: AsyncLock } = {}

	eqEmitter(symbol: string) {
		return this._eqEmitters[symbol]
	}

	async subscribeToEventQueue(symbol: string) {
		if (this._eqEmittersLocks[symbol]) {
			await this._eqEmittersLocks[symbol]!.waitAndLock()
		} else {
			this._eqEmittersLocks[symbol] = new AsyncLock()
			await this._eqEmittersLocks[symbol]!.waitAndLock()
		}
		if (this._eqEmitters[symbol]) return
		this._eqEmitters[symbol] = new EventEmitter()
		const { dexMarket } = await this.getZoMarketAccounts({
			market: this.markets[symbol]!,
			withOrderbooks: false,
			withEventQueues: true,
		})
		const eventQueueAddress = dexMarket.eventQueueAddress
		this._eqEmittersKeys[symbol] = this.connection.onAccountChange(
			eventQueueAddress,
			async (eventQueueBuffer) => {
				const eventQueue = decodeEventQueue(eventQueueBuffer.data)
				this.zoMarketAccounts[symbol]!.eventQueue = eventQueue
				if (this._eqEmitters[symbol]) {
					this._eqEmitters[symbol]!.emit(
						State.getEventQueueUpdateEventName(symbol),
						{
							eventQueue: eventQueue,
						},
					)
				}
			},
			this.commitment,
		)
		this._eqEmittersLocks[symbol]!.unlock()
	}

	async unsubscribeFromEventQueue(symbol: string) {
		if (this._eqEmittersLocks[symbol]) {
			await this._eqEmittersLocks[symbol]!.waitAndLock()
		} else {
			this._eqEmittersLocks[symbol] = new AsyncLock()
			await this._eqEmittersLocks[symbol]!.waitAndLock()
		}
		try {
			if (this._eqEmittersKeys[symbol]) {
				this.connection
					.removeAccountChangeListener(this._eqEmittersKeys[symbol]!)
					.then()

				this.eventEmitter!.removeAllListeners()
				delete this._eqEmittersKeys[symbol]
				delete this._eqEmitters[symbol]
			}
		} catch (_) {
			//
		}
		this._eqEmittersLocks[symbol]!.unlock()
	}
}
