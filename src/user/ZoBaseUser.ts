import { PublicKey } from "@solana/web3.js"
import { MarketInfo, PositionInfo } from "../types/dataTypes"
import Num from "../Num"
import { USD_DECIMALS } from "../config"
import Decimal from "decimal.js"
import { Margin } from "../index"

export abstract class ZoBaseUser {
	/**
	 * internal info
	 */
	margin: Margin
	realmConnected: boolean
	realm: any
	positionsArr: PositionInfo[] = []

	constructor(margin: Margin, realm?: any, realmConnected?: boolean) {
		this.margin = margin
		if (realmConnected) {
			this.realmConnected = realmConnected
			this.realm = realm
		} else {
			this.realmConnected = false
		}
		this.loadPositionsArr(
			margin.state.markets,
			margin.state.indexToMarketKey,
		)
	}
	/**
	 * loading positions, note that markets have to be loaded in the correct order. It also removes the sign from coins & pCoins.
	 * @param markets
	 * @param indexToMarketKey
	 */
	loadPositionsArr(
		markets: { [key: string]: MarketInfo },
		indexToMarketKey: { [key: number]: string },
	): PositionInfo[] {
		const positionsArr: PositionInfo[] = []
		const positions: { [key: string]: PositionInfo } = {}
		const recordedMarkets = {}
		let index = 0
		for (const oo of this.margin.control.data.openOrdersAgg) {
			if (
				oo.key.toString() != PublicKey.default.toString() &&
				markets[indexToMarketKey[index]!]
			) {
				const market = markets[indexToMarketKey[index]!]!
				const coins = new Num(oo.posSize, market.assetDecimals)
				const pCoins = new Num(oo.nativePcTotal, USD_DECIMALS)
				const realizedPnl = new Num(
					oo.realizedPnl,
					market.assetDecimals,
				)
				const fundingIndex = new Num(oo.fundingIndex, USD_DECIMALS)
					.decimal
				const position = {
					coins: new Num(Math.abs(coins.number), coins.decimals),
					pCoins: new Num(Math.abs(pCoins.number), pCoins.decimals),
					realizedPnL: realizedPnl,
					fundingIndex: fundingIndex,
					marketKey: market.symbol,
					isLong: coins.number > 0,
				}
				positionsArr.push(position)
				positions[market.symbol] = position
				recordedMarkets[market.symbol] = true
			}
			index++
		}

		for (const market of Object.values(markets)) {
			if (recordedMarkets[market.symbol] == null) {
				const position = {
					coins: new Num(0, market.assetDecimals),
					pCoins: new Num(0, USD_DECIMALS),
					realizedPnL: new Num(0, 1),
					fundingIndex: new Decimal(1),
					marketKey: market.symbol,
					isLong: true,
				}
				positionsArr.push(position)
				positions[market.symbol] = position
			}
		}
		this.positionsArr = positionsArr
		return positionsArr
	}
}
