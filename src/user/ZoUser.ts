import { ZoDBUser } from "./zoDBUser/ZoDBUser"
import { ChangeEvent, UpdateEvents, Wallet } from "../types"
import { Commitment, Connection, Keypair } from "@solana/web3.js"
import { AsyncLock, Cluster, createProgram, OrderInfo, PositionInfo } from "../utils"
import { Provider } from "@project-serum/anchor"
import { ZO_DEVNET_STATE_KEY, ZO_MAINNET_STATE_KEY } from "../config"
import { Margin, State } from "../index"
import Decimal from "decimal.js"
import BN from "bn.js"
import EventEmitter from "eventemitter3"
import * as Realm from "realm-web"

export class ZoUser extends ZoDBUser {
	get program() {
		return this.margin.program
	}

	get provider() {
		return this.margin.provider
	}

	get cache() {
		return this.margin.state.cache
	}

	get control() {
		return this.margin.control
	}

	get connection() {
		return this.margin.connection
	}

	get state() {
		return this.margin.state
	}

	get orders() {
		return this.margin.orders
	}

	get balances() {
		return this.margin.balances
	}

	get positions() {
		return this.margin.positions
	}

	position(marketKey: string) {
		return this.margin.position(marketKey)
	}

	get markets() {
		return this.margin.state.markets
	}

	get assets() {
		return this.margin.state.assets
	}

	get funding(): Decimal {
		return this.margin.funding
	}

	positionPnL(positionOrMarketKey: PositionInfo | string) {
		if (typeof positionOrMarketKey == "string") {
			return this.margin.positionPnL(this.position(positionOrMarketKey))
		}
		return this.margin.positionPnL(positionOrMarketKey)
	}

	positionPnLBasedOnMarkPrice(positionOrMarketKey: PositionInfo | string) {
		if (typeof positionOrMarketKey == "string") {
			return this.margin.positionPnLBasedOnMarkPrice(
				this.position(positionOrMarketKey),
			)
		}
		return this.margin.positionPnLBasedOnMarkPrice(positionOrMarketKey)
	}

	positionFunding(positionOrMarketKey: PositionInfo | string) {
		if (typeof positionOrMarketKey == "string") {
			return this.margin.positionFunding(
				this.position(positionOrMarketKey),
			)
		}
		return this.margin.positionFunding(positionOrMarketKey)
	}

	get unweightedCollateralValue(): Decimal {
		return this.margin.unweightedCollateralValue
	}

	get unweightedAccountValue(): Decimal {
		return this.margin.unweightedAccountValue
	}

	get maintenanceMarginFraction(): Decimal {
		return this.margin.maintenanceMarginFraction
	}

	get openMarginFraction(): Decimal {
		return this.margin.openMarginFraction
	}

	get marginFraction(): Decimal {
		return this.margin.marginFraction
	}

	get totalPositionNotional(): Decimal {
		return this.margin.totalPositionNotional
	}

	longOrderSize(marketKey: string): Decimal {
		return this.margin.longOrderSize(marketKey)
	}

	shortOrderSize(marketKey: string): Decimal {
		return this.margin.shortOrderSize(marketKey)
	}

	openSize(marketKey: string): Decimal {
		return this.margin.shortOrderSize(marketKey)
	}

	get totalOpenPositionNotional(): Decimal {
		return this.margin.totalPositionNotional
	}

	get tiedCollateral(): Decimal {
		return this.margin.totalPositionNotional
	}

	get freeCollateralValue(): Decimal {
		return this.margin.totalPositionNotional
	}

	get cumulativeUnrealizedPnL(): Decimal {
		return this.margin.totalPositionNotional
	}

	collateralWithdrawable(marketKey: string): Decimal {
		return this.margin.collateralWithdrawable(marketKey)
	}

	collateralWithdrawableWithBorrow(marketKey: string): Decimal {
		return this.margin.collateralWithdrawable(marketKey)
	}

	getOrderByOrderId(orderId: string | BN): OrderInfo | null {
		return this.margin.getOrderByOrderId(orderId)
	}

	getBestAsk(marketKey: string): number {
		return this.state.getBestAsk(marketKey)
	}

	getBestBid(marketKey: string): number {
		return this.state.getBestBid(marketKey)
	}

	async getOrderbook(marketKey: string) {
		const { asks, bids } = await this.state.getZoMarketAccounts({
			market: this.markets[marketKey]!,
			withOrderbooks: true,
		})
		return {
			asks: asks.getL2(1_000_000).map((x) => [x[0], x[1]]),
			bids: bids.getL2(1_000_000).map((x) => [x[0], x[1]]),
		}
	}

	subLock = new AsyncLock()
	eventEmitter: EventEmitter<UpdateEvents, ChangeEvent<any>> | null = null

	async subscribe(withBackup = false) {
		await this.subLock.waitAndLock()
		if (this.eventEmitter) {
			return
		}
		this.eventEmitter = new EventEmitter()
		await this.margin.subscribe(withBackup)
    this.margin.eventEmitter!.addListener(
    	UpdateEvents.marginModified,
    	(data) => {
        this.eventEmitter!.emit(UpdateEvents.marginModified, data)

        this.loadPositionsArr(
        	this.margin.state.markets,
        	this.margin.state.indexToMarketKey,
        )
    	},
    )
    this.margin.control.eventEmitter!.addListener(
    	UpdateEvents.controlModified,
    	(data) => {
        this.eventEmitter!.emit(UpdateEvents.controlModified, data)

        this.loadPositionsArr(
        	this.margin.state.markets,
        	this.margin.state.indexToMarketKey,
        )
    	},
    )
    this.state.eventEmitter!.addListener(UpdateEvents.stateModified,
    	(data) => {
        this.eventEmitter!.emit(UpdateEvents.stateModified, data)
        this.loadPositionsArr(
        	this.margin.state.markets,
        	this.margin.state.indexToMarketKey,
        )
    	})
    this.state.eventEmitter!.addListener(
    	UpdateEvents._cacheModified,
    	(data) => {
        this.eventEmitter!.emit(UpdateEvents._cacheModified, data)

        this.loadPositionsArr(
        	this.margin.state.markets,
        	this.margin.state.indexToMarketKey,
        )
    	},
    )
    this.subLock.unlock()
	}

	async unsubscribe() {
		await this.subLock.waitAndLock()
		await this.margin.unsubscribe()
    this.eventEmitter!.removeAllListeners()
    this.eventEmitter = null
    this.subLock.unlock()
	}

	static async load(
		account: Wallet | Keypair,
		cluster: Cluster,
		opts: {
      withRealm: boolean
      commitment?: Commitment
      skipPreflight?: boolean
      rpcUrl: string
    },
	) {
		let wallet: Wallet
		if (account instanceof Keypair) {
			wallet = {
				publicKey: account.publicKey,
				signTransaction: async (tx) => {
					await tx.sign(account)
					return tx
				},
				signAllTransactions: async (txs) => {
					for (const tx of txs) {
						await tx.sign(account)
					}
					return txs
				},
			}
		} else {
			wallet = account
		}

		const connection = new Connection(opts.rpcUrl, opts.commitment)
		const provider = new Provider(connection, wallet, {
			commitment: opts.commitment,
			skipPreflight: opts.skipPreflight,
		})
		const program = createProgram(provider, cluster)
		const stateKey =
      cluster == Cluster.Devnet
      	? ZO_DEVNET_STATE_KEY
      	: ZO_MAINNET_STATE_KEY
		const state = await State.load(program, stateKey, opts.commitment)
		const margin = await Margin.load(
			program,
			state,
			null,
			wallet.publicKey,
			opts.commitment,
		)
		let realm, realmConnected
		if (opts.withRealm) {
			const credentials = Realm.Credentials.anonymous()
			const app = Realm.App.getApp("01-lgbct")
			realm = await app.logIn(credentials)
			realmConnected = true
		}
		return new ZoUser(margin, realm, realmConnected)
	}
}
