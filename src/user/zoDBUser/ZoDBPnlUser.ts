import { checkIfNewAndPush } from "./utils/checkIfNewAndPush"
import { ZoBaseUser } from "../ZoBaseUser"
import { ALL_HISTORY, ALL_MARKETS, HISTORY_ENTRIES_PER_PAGE, USD_DECIMALS } from "../../config"

export interface PnlHistoryEntry {
	tx: string
	marketKey: string
	pnl: number
	pnlQuote: number
	size: number
	isLong: boolean
	entryPrice: number
	isMaker?: boolean
	finalPrice: number
	date: Date
}

export class ZoDBPnlUser extends ZoBaseUser {
	pnlHistory: { [key: string]: PnlHistoryEntry[] } = {}
	pnlPagesParsed: { [key: string]: number } = {}
	pnlCurrentPage: { [key: string]: number } = {}

	async _getPnls(page: number, marketKey: string) {
		if (!this.realmConnected) {
			return []
		}
		const market =
			marketKey == ALL_MARKETS || marketKey == ALL_HISTORY
				? null
				: marketKey
		return await this.realm.functions.getUserPnl({
			page: marketKey == ALL_HISTORY ? -1 : page,
			margin: this.margin.pubkey.toString(),
			market,
		})
	}

	async _insertPnls(
		marketKey: string,
		assetDecimalsDecoder: (sym) => number,
	) {
		while (
			this.pnlPagesParsed[marketKey]! <= this.pnlCurrentPage[marketKey]!
		) {
			const pnls = await this._getPnls(
				this.pnlPagesParsed[marketKey]!,
				marketKey,
			)

			for (const pnl of pnls) {
				const size =
					(pnl.isLong ? pnl.qtyPaid : pnl.qtyReceived) /
					Math.pow(10, assetDecimalsDecoder(pnl.symbol))
				const usdQuote =
					(pnl.isLong ? pnl.qtyReceived : pnl.qtyPaid) /
					Math.pow(10, USD_DECIMALS)
				const pnlNumber = pnl.pnl / Math.pow(10, USD_DECIMALS) / size
				const finalPrice = usdQuote / size
				const entryPrice =
					finalPrice - (pnl.isLong ? pnlNumber : -pnlNumber)
				const pnlPercentage =
					(((pnlNumber > 0 ? 1 : -1) *
						Math.abs(finalPrice - entryPrice)) /
						entryPrice) *
					100
				checkIfNewAndPush(this.pnlHistory[marketKey], {
					pnl: pnlPercentage,
					pnlQuote: pnl.pnl / Math.pow(10, USD_DECIMALS),
					tx: pnl.sig,
					size: size,
					finalPrice,
					entryPrice,
					marketKey: pnl.symbol,
					isLong: pnl.isLong,
					date: new Date(pnl.time * 1000),
				})
			}
			this.pnlPagesParsed[marketKey]++
		}
	}

	async getPnlHistory(
		page: number,
		currentMarketKey: string,
		assetDecimalsDecoder: (sym) => number,
		allMarkets: boolean,
		allHistory?: boolean,
	) {
		const marketKey = allMarkets
			? allHistory
				? ALL_HISTORY
				: ALL_MARKETS
			: currentMarketKey
		this.pnlCurrentPage[marketKey] = page
		if (
			this.pnlHistory[marketKey] == null ||
			this.pnlHistory[marketKey]!.length == 0
		) {
			this.pnlPagesParsed[marketKey] = 0
			this.pnlCurrentPage[marketKey] = 0
			this.pnlHistory[marketKey] = []
		}
		if (allMarkets && this.pnlHistory[marketKey]!.length != 0) {
			return this.pnlHistory[marketKey]!.filter(
				(entry) => entry.size != 0,
			)
		}
		if (this.pnlPagesParsed[marketKey]! <= page) {
			await this._insertPnls(marketKey, assetDecimalsDecoder)
		}
		const pnlHistory: Array<any> = []
		for (let i = 0; i < this.pnlHistory[marketKey]!.length; i++) {
			pnlHistory.push(this.pnlHistory[marketKey]![i]!)
		}
		if (allMarkets) {
			return pnlHistory.filter((entry) => entry.size != 0)
		}

		return pnlHistory
			.filter((entry) => entry.size != 0)
			.slice(
				page * HISTORY_ENTRIES_PER_PAGE,
				(page + 1) * HISTORY_ENTRIES_PER_PAGE,
			)
	}
}
