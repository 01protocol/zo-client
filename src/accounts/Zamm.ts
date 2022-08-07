import {
	Commitment,
	PublicKey,
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
	TransactionInstruction,
} from "@solana/web3.js"
import { Program } from "@project-serum/anchor"
import BaseAccount from "./BaseAccount"
import State from "./State"
import { UpdateEvents, ZammSchema, Zo } from "../types"
import EventEmitter from "eventemitter3"
import { USDC_DECIMALS, WRAPPED_SOL_MINT, ZAMM_PROGRAM_ID } from "../config"
import { ZAMM_IDL, ZammIdlType } from "../types/zamm"
import Margin from "./margin/Margin"
import BN from "bn.js"
import Num from "../Num"
import { USDC_SYMBOL } from "../utils"
import Decimal from "decimal.js"
import { decodeEventQueue, Event } from "../zoDex/queue"

type Schema = Omit<ZammSchema, "rewardIndex" | "status">

/**
 * The Zamm account stores and tracks oracle prices, mark prices, funding and borrow lending multipliers.
 */
export default class Zamm extends BaseAccount<Schema> {
	eventEmitter: EventEmitter<UpdateEvents, any> | null = null
	marketSymbol = "SOL-PERP"
	X = new Decimal(0)
	Y = new Decimal(0)

	private constructor(
		public zammProgram: Program<ZammIdlType>,
		k: PublicKey,
		data: Schema,
		public zammMargin: Margin,
		public zoProgram: Program<Zo>,
		commitment?: Commitment,
	) {
		super(zoProgram, k, data, commitment)
	}

	/**
	 * Loads a new Zamm object from its public key.
	 * @param zoProgram
	 * @param k The zamm account's public key.
	 * @param state
	 * @param commitment
	 */
	static async load(
		zoProgram: Program<Zo>,
		k: PublicKey,
		state: State,
		commitment = "processed" as Commitment,
	) {
		const zammProgram = this.getZammProgram(zoProgram)
		const zammSchema = await Zamm.fetch(zammProgram, k, commitment)
		const margin = await Margin.load(zoProgram, state, null, k)
		return new this(
			zammProgram,
			k,
			zammSchema,
			margin,
			zoProgram,
			commitment,
		)
	}

	/**
	 * Loads a new Zamm object from its public key. from prefetched data
	 * @param zoProgram
	 * @param k The zamm account's public key.
	 * @param margin
	 * @param zammSchema
	 * @param commitment
	 */
	static loadPrefetched(
		zoProgram: Program<Zo>,
		k: PublicKey,
		margin: Margin,
		zammSchema: Schema,
		commitment = "processed" as Commitment,
	) {
		const zammProgram = this.getZammProgram(zoProgram)
		return new this(
			zammProgram,
			k,
			zammSchema,
			margin,
			zoProgram,
			commitment,
		)
	}

	private static async fetch(
		zammProgram: Program<ZammIdlType>,
		k: PublicKey,
		commitment: Commitment,
	): Promise<Schema> {
		return (await zammProgram.account["zamm"].fetch(
			k,
			commitment,
		)) as Schema
	}

	private static getZammProgram(
		zoProgram: Program<Zo>,
	): Program<ZammIdlType> {
		return new Program<ZammIdlType>(
			ZAMM_IDL,
			ZAMM_PROGRAM_ID,
			zoProgram.provider,
		)
	}

	/**
	 *
	 * @param xSensitivity - sensitivity to x changes
	 * @param ySensitivity - sensitivity to y changes
	 * @param withBackup - have a backup 'confirmed' channel to listen to
	 * @param stateLimit - state limit frequency update
	 * @param cacheLimit - cache limit frequency update
	 */
	async subscribe(
		xSensitivity = 100,
		ySensitivity = 10,
		withBackup = false,
		stateLimit = 0,
		cacheLimit = 0,
	): Promise<void> {
		await this.subLock.waitAndLock()
		if (this.eventEmitter) {
			return
		}
		await this.zammMargin.subscribe(withBackup, stateLimit, cacheLimit)
		await this.zammMargin.state.subscribeToEventQueue(this.marketSymbol)
		this.eventEmitter = new EventEmitter()
		const anchorEventEmitter = await this._subscribe(
			"zamm",
			withBackup,
			this.zammProgram,
		)
		const that = this
		await this.zammMargin.eventEmitter?.addListener(
			UpdateEvents.marginModified,
			async () => {
				const { X, Y, price } = await this.getXY()
				const oldX = this.X.mul(xSensitivity).round()
				const oldY = this.Y.mul(ySensitivity).round()
				this.X = X
				this.Y = Y
				if (
					!X.mul(xSensitivity).round().eq(oldX) ||
					!Y.mul(ySensitivity).round().eq(oldY)
				) {
					this.eventEmitter!.emit(UpdateEvents.zammModified, {
						X,
						Y,
						price,
					})
				}
			},
		)
		await this.zammMargin.state
			.eqEmitter(this.marketSymbol)!
			.addListener(
				State.getEventQueueUpdateEventName(this.marketSymbol),
				async () => {
					const { X, Y, price } = await this.getXY()
					const oldX = this.X.mul(xSensitivity).round()
					const oldY = this.Y.mul(ySensitivity).round()
					this.X = X
					this.Y = Y
					if (
						!X.mul(xSensitivity).round().eq(oldX) ||
						!Y.mul(ySensitivity).round().eq(oldY)
					) {
						this.eventEmitter!.emit(UpdateEvents.zammModified, {
							X,
							Y,
							price,
						})
					}
				},
			)
		anchorEventEmitter.addListener("change", async (account) => {
			that.data = account as Schema
			const { X, Y, price } = await this.getXY()
			const oldX = this.X.mul(xSensitivity).round()
			const oldY = this.Y.mul(ySensitivity).round()
			this.X = X
			this.Y = Y
			if (
				!X.mul(xSensitivity).round().eq(oldX) ||
				!Y.mul(ySensitivity).round().eq(oldY)
			) {
				this.eventEmitter!.emit(UpdateEvents.zammModified, {
					X,
					Y,
					price,
				})
			}
		})
	}

	async unsubscribe() {
		await this.subLock.waitAndLock()
		try {
			await this._unsubscribe()
			await this.zammMargin.unsubscribe()
			await this.zammMargin.state.unsubscribeFromEventQueue(
				this.marketSymbol,
			)
			this.eventEmitter!.removeAllListeners()
			this.eventEmitter = null
		} catch (_) {
			//
		}
		this.subLock.unlock()
	}

	async getXY() {
		const eqKey = (
			await this.zammMargin.state.getMarketBySymbol(this.marketSymbol)
		).getEventQueueAddress()
		const [marginData, controlData, eventQueueData, zammData] = (
			await this.connection.getMultipleAccountsInfo([
				this.zammMargin.pubkey,
				this.zammMargin.control.pubkey,
				eqKey,
				this.pubkey,
			])
		).map((acc) => acc!.data! as Buffer)

		const marginSchema = this.zoProgram.coder.accounts.decode(
			"margin",
			marginData!,
		)

		const controlSchema = this.zoProgram.coder.accounts.decode(
			"control",
			controlData!,
		)

		const zammSchema = this.zammProgram.coder.accounts.decode(
			"zamm",
			zammData!,
		)

		const eventQueue = decodeEventQueue(eventQueueData!)
		const margin = await Margin.loadPrefetched(
			this.program,
			this.zammMargin.state,
			null,
			{
				publicKey: this.zammMargin.pubkey,
				account: marginSchema,
			},
			{
				publicKey: this.zammMargin.control.pubkey,
				account: controlSchema,
			},
			false,
		)

		const zamm = Zamm.loadPrefetched(
			this.zoProgram,
			this.pubkey,
			margin,
			zammSchema,
			this.commitment,
		)

		return Zamm.computeXY(zamm, eventQueue)
	}

	async getXYFast() {
		const eventQueue = (
			await this.zammMargin.state.getZoMarketAccounts({
				market: this.zammMargin.state.markets[this.marketSymbol]!,
				withOrderbooks: false,
				withEventQueues: true,
			})
		).eventQueue

		return Zamm.computeXY(this, eventQueue)
	}

	static computeXY(zamm: Zamm, eventQueue: Event[]) {
		const margin = zamm.zammMargin
		const control = zamm.zammMargin.control.toString()

		const { eqY, eqX } = eventQueue.reduce(
			(accum, event) => {
				if (event.control.toString() == control) {
					if (event.eventFlags.maker && event.eventFlags.fill) {
						if (event.eventFlags.bid) {
							return {
								eqY: accum.eqY.sub(event.nativeQuantityPaid),
								eqX: accum.eqX.add(
									event.nativeQuantityReleased,
								),
							}
						} else {
							return {
								eqY: accum.eqY.add(
									event.nativeQuantityReleased,
								),
								eqX: accum.eqX.sub(event.nativeQuantityPaid),
							}
						}
					}
				}
				return accum
			},
			{ eqY: new BN(0), eqX: new BN(0) },
		)
		const position = margin.position(zamm.marketSymbol)

		const zammX = zamm.data.x
		const signedCoins = position.coins.n.mul(
			new BN(position.isLong ? 1 : -1),
		)
		const XN = zammX.add(eqX).add(signedCoins)

		const signedPcoins = position.pCoins.n.mul(
			new BN(position.isLong ? -1 : 1),
		)
		const YN = eqY.add(margin.balances[USDC_SYMBOL]!.n).add(signedPcoins)

		const X = new Num(
			XN,
			margin.state.markets[zamm.marketSymbol]!.assetDecimals,
		).decimal

		const Y = new Num(YN, USDC_DECIMALS).decimal
		return { X, Y, price: Y.div(X) }
	}

	async refresh(): Promise<void> {
		this.data = await Zamm.fetch(
			this.zammProgram,
			this.pubkey,
			this.commitment,
		)
	}

	async marketArb(arberMargin: Margin, x: number, isLong: boolean) {
		const X = new Num(
			Math.abs(x) * (isLong ? 1 : -1),
			this.zammMargin.state.markets[this.marketSymbol]!.assetDecimals,
		).n
		const y =
			x > 0
				? x *
				  this.zammMargin.state.markets[this.marketSymbol]!.indexPrice
						.number *
				  10
				: -x *
				  this.zammMargin.state.markets[this.marketSymbol]!.indexPrice
						.number *
				  0.1
		const Y = new Num(y, USDC_DECIMALS).n
		return await this.arbRaw(arberMargin, X, Y)
	}

	async limitArb(arberMargin: Margin, x: number, price: number, isLong) {
		const X = new Num(
			Math.abs(x) * (isLong ? 1 : -1),
			this.zammMargin.state.markets[this.marketSymbol]!.assetDecimals,
		).n
		const y = Math.abs(x * price)
		const Y = new Num(y, USDC_DECIMALS).n
		return await this.arbRaw(arberMargin, X, Y)
	}

	async arbRaw(arberMargin: Margin, dx: BN, maxDy: BN) {
		const market = await this.zammMargin.state.getMarketBySymbol(
			this.marketSymbol,
		)
		const zammOo = (
			await this.zammMargin.getOpenOrdersKeyBySymbol(this.marketSymbol)
		)[0]

		const placeOrdersIx = await this.zammProgram.instruction.placeOrders({
			accounts: {
				payer: arberMargin.owner!,
				zamm: this.pubkey,
				zoState: this.zammMargin.state.pubkey,
				zoStateSigner: this.zammMargin.state.signer,
				zoCache: this.zammMargin.state.cache.pubkey,
				zammMargin: this.zammMargin.pubkey,
				zammControl: this.zammMargin.control.pubkey,
				zammOo: zammOo,
				marketKey: market.address,
				reqQ: market.requestQueueAddress,
				eventQ: market.eventQueueAddress,
				marketBids: market.bidsAddress,
				marketAsks: market.asksAddress,
				zoProgram: arberMargin.program.programId,
				zoDexProgram: this.zammMargin.getDexProgram(),
				systemProgram: SystemProgram.programId,
				rent: SYSVAR_RENT_PUBKEY,
			},
		})
		const data = Buffer.from(
			Uint8Array.of(
				0,
				...new BN(1200000).toArray("le", 4),
				...new BN(5000).toArray("le", 4),
			),
		)

		return await this.zammProgram.rpc.arbZamm(dx, maxDy, {
			accounts: {
				authority: arberMargin.owner!,
				zamm: this.pubkey,
				xMint: WRAPPED_SOL_MINT,
				zoState: this.zammMargin.state.pubkey,
				zoStateSigner: this.zammMargin.state.signer,
				zoCache: this.zammMargin.state.cache.pubkey,
				zammMargin: this.zammMargin.pubkey,
				zammControl: this.zammMargin.control.pubkey,
				zammOo: zammOo,
				authMargin: arberMargin.pubkey,
				authControl: arberMargin.control.pubkey,
				authOo: (
					await arberMargin.getOpenOrdersKeyBySymbol(
						this.marketSymbol,
					)
				)[0],
				dexMarket: market.address,
				reqQ: market.requestQueueAddress,
				eventQ: market.eventQueueAddress,
				marketBids: market.bidsAddress,
				marketAsks: market.asksAddress,
				systemProgram: SystemProgram.programId,
				zoProgram: arberMargin.program.programId,
				zoDexProgram: this.zammMargin.getDexProgram(),
			},
			preInstructions: [
				new TransactionInstruction({
					keys: [],
					programId: new PublicKey(
						"ComputeBudget111111111111111111111111111111",
					),
					data,
				}),
			],
			postInstructions: [
				placeOrdersIx,
				placeOrdersIx,
				placeOrdersIx,
				placeOrdersIx,
				placeOrdersIx,
			],
		})
	}
}
