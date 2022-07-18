import {
	Commitment,
	PublicKey,
	SystemProgram,
	SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js"
import { Program, utils } from "@project-serum/anchor"
import BaseAccount from "./BaseAccount"
import State from "./State"
import { UpdateEvents, ZammSchema, Zo } from "../types"
import EventEmitter from "eventemitter3"
import {
	TOKEN_PROGRAM_ID,
	USDC_DECIMALS,
	WRAPPED_SOL_MINT,
	ZAMM_PROGRAM_ID,
} from "../config"
import { ZAMM_IDL, ZammIdlType } from "../types/zamm"
import Margin from "./margin/Margin"
import BN from "bn.js"
import Num from "../Num"
import { USDC_SYMBOL } from "../utils"
import Decimal from "decimal.js"

type Schema = Omit<ZammSchema, "rewardIndex" | "status">

/**
 * The Zamm account stores and tracks oracle prices, mark prices, funding and borrow lending multipliers.
 */
export default class Zamm extends BaseAccount<Schema> {
	eventEmitter: EventEmitter<UpdateEvents> | null = null
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

	async subscribe(xSensitivity = 100, ySensitivity = 10): Promise<void> {
		await this.subLock.waitAndLock()
		if (this.eventEmitter) {
			return
		}
		await this.zammMargin.subscribe()
		await this.zammMargin.state.subscribeToEventQueue(this.marketSymbol)
		this.eventEmitter = new EventEmitter()
		const anchorEventEmitter = await this._subscribe(
			"zamm",
			this.zammProgram,
		)
		const that = this
		await this.zammMargin.eventEmitter?.addListener(
			UpdateEvents.marginModified,
			async () => {
				const oldX = this.X.mul(xSensitivity).round()
				const oldY = this.Y.mul(ySensitivity).round()
				const { X, Y, price } = await this.getXY()
				if (
					!X.mul(xSensitivity).round().eq(oldX) ||
					!Y.mul(ySensitivity).round().eq(oldY)
				)
					this.eventEmitter!.emit(UpdateEvents.zammModified, {
						X,
						Y,
						price,
					})
			},
		)
		await this.zammMargin.state
			.eqEmitter(this.marketSymbol)!
			.addListener(UpdateEvents.eventQueueModified, async () => {
				const oldX = this.X
				const oldY = this.Y
				const { X, Y, price } = await this.getXY()
				if (!X.eq(oldX) || !Y.eq(oldY))
					this.eventEmitter!.emit(UpdateEvents.zammModified, {
						X,
						Y,
						price,
					})
			})
		anchorEventEmitter.addListener("change", async (account) => {
			that.data = account as Schema
			const oldX = this.X
			const oldY = this.Y
			const { X, Y, price } = await this.getXY()
			if (!X.eq(oldX) || !Y.eq(oldY))
				this.eventEmitter!.emit(UpdateEvents.zammModified, {
					X,
					Y,
					price,
				})
		})
	}

	async unsubscribe() {
		await this.subLock.waitAndLock()
		try {
			await this.zammProgram.account["zamm"].unsubscribe(this.pubkey)
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
		const eventQueue = (
			await this.zammMargin.state.getZoMarketAccounts({
				market: this.zammMargin.state.markets[this.marketSymbol]!,
				withOrderbooks: false,
				withEventQueues: true,
			})
		).eventQueue

		const control = this.zammMargin.control.pubkey.toString()

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

		const position = this.zammMargin.position(this.marketSymbol)

		const zammX = this.data.x
		const signedCoins = position.coins.n.mul(
			new BN(position.isLong ? 1 : -1),
		)
		const XN = zammX.add(eqX).add(signedCoins)

		const signedPcoins = position.pCoins.n.mul(
			new BN(position.isLong ? -1 : 1),
		)
		const YN = eqY
			.add(this.zammMargin.balances[USDC_SYMBOL]!.n)
			.add(signedPcoins)

		const X = new Num(
			XN,
			this.zammMargin.state.markets[this.marketSymbol]!.assetDecimals,
		).decimal
		const Y = new Num(YN, USDC_DECIMALS).decimal
		this.X = X
		this.Y = Y
		return { X, Y, price: Y.div(X) }
	}

	async refresh(): Promise<void> {
		this.data = await Zamm.fetch(
			this.zammProgram,
			this.pubkey,
			this.commitment,
		)
	}

	async marketArb(arberMargin: Margin, x: number) {
		const X = new Num(
			x,
			this.zammMargin.state.markets[this.marketSymbol]!.assetDecimals,
		).n
		const y =
			x *
			this.zammMargin.state.markets[this.marketSymbol]!.indexPrice
				.number *
			10
		const Y = new Num(y, USDC_DECIMALS).n
		return await this.arbRaw(arberMargin, X, Y)
	}

	async limitArb(arberMargin: Margin, x: number, price: number) {
		const X = new Num(
			x,
			this.zammMargin.state.markets[this.marketSymbol]!.assetDecimals,
		).n
		const y = x * price
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

		const zammStateKey = (
			await PublicKey.findProgramAddress(
				[utils.bytes.utf8.encode("statev1")],
				this.zammProgram.programId,
			)
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

		return await this.zammProgram.rpc.arbZamm(dx, maxDy, {
			accounts: {
				state: zammStateKey,
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
				tokenProgram: TOKEN_PROGRAM_ID,
				systemProgram: SystemProgram.programId,
				zoProgram: arberMargin.program.programId,
				zoDexProgram: this.zammMargin.getDexProgram(),
			},
			postInstructions: [placeOrdersIx, placeOrdersIx, placeOrdersIx],
		})
	}
}
