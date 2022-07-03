import { PublicKey, Transaction } from "@solana/web3.js"
import { IdlAccounts, IdlTypes } from "@project-serum/anchor"
import BN from "bn.js"
import { Zo } from "./types/zo"
import { ZammIdlType } from "./types/zamm"

export interface Wallet {
	publicKey: PublicKey

	signTransaction(tx: Transaction): Promise<Transaction>

	signAllTransactions(txs: Transaction[]): Promise<Transaction[]>
}

export type TransactionId = string

export * from "./types/changeLog"

// NOTE: These intersection types are a temporary workaround,
// as anchor's type inference isn't complete yet.

export { Zo } from "./types/zo"

// eslint-disable-next-line @typescript-eslint/ban-types
export type OracleType = { pyth: {} } | { switchboard: {} }
export type PerpType =
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { future: {} }
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { callOption: {} }
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { putOption: {} }
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { square: {} }

export type OrderType =
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { limit: {} }
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { immediateOrCancel: {} }
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { postOnly: {} }
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { reduceOnlyIoc: {} }
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { reduceOnlyLimit: {} }
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { fillOrKill: {} }

export type SpecialOrderType =
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { takeProfit: {} }
	// eslint-disable-next-line @typescript-eslint/ban-types
	| { stopLoss: {} }

export enum OrderTypeName {
	Limit = "Limit",
	ImmediateOrCancel = "ImmediateOrCancel",
	PostOnly = "PostOnly",
	ReduceOnlyIoc = "ReduceOnlyIoc",
	ReduceOnlyLimit = "ReduceOnlyLimit",
	FillOrKill = "FillOrKill",
}

export function parseOrderType(orderType: OrderType | OrderTypeName) {
	if (typeof orderType == "string") {
		switch (orderType) {
			case OrderTypeName.Limit:
				return { limit: {} }
			case OrderTypeName.ImmediateOrCancel:
				return { immediateOrCancel: {} }
			case OrderTypeName.PostOnly:
				return { postOnly: {} }
			case OrderTypeName.ReduceOnlyIoc:
				return { reduceOnlyIoc: {} }
			case OrderTypeName.ReduceOnlyLimit:
				return { reduceOnlyLimit: {} }
			case OrderTypeName.FillOrKill:
				return { fillOrKill: {} }
		}
	}
	return orderType as OrderType
}

type WrappedI80F48 = { data: BN }
type Symbol = { data: number[] }
type OracleSource = IdlTypes<Zo>["OracleSource"] & {
	ty: OracleType
}
type CollateralInfo = Omit<IdlTypes<Zo>["CollateralInfo"], "oracleSymbol"> & {
	oracleSymbol: symbol
}
type PerpMarketInfo = Omit<
	IdlTypes<Zo>["PerpMarketInfo"],
	"symbol" | "oracleSymbol" | "perpType"
> & {
	symbol: symbol
	oracleSymbol: symbol
	perpType: PerpType
}
type OpenOrdersInfo = IdlTypes<Zo>["OpenOrdersInfo"]
type TwapInfo = Omit<
	IdlTypes<Zo>["TwapInfo"],
	"cumulAvg" | "open" | "high" | "low" | "close" | "lastSampleStartTime"
> & {
	cumulAvg: WrappedI80F48
	open: WrappedI80F48
	high: WrappedI80F48
	low: WrappedI80F48
	close: WrappedI80F48
	lastSampleStartTime: BN
}
type SpecialOrdersInfo = Omit<IdlTypes<Zo>["SpecialOrdersInfo"], "ty"> & {
	ty: SpecialOrderType
}

type OracleCache = Omit<IdlTypes<Zo>["OracleCache"], "symbol"> & {
	symbol: symbol
	sources: OracleSource[]
	price: WrappedI80F48
	twap: WrappedI80F48
}
type MarkCache = Omit<IdlTypes<Zo>["MarkCache"], "price" | "twap"> & {
	price: WrappedI80F48
	twap: TwapInfo
}
type BorrowCache = Omit<
	IdlTypes<Zo>["BorrowCache"],
	"supply" | "borrows" | "supplyMultiplier" | "borrowMultiplier"
> & {
	supply: WrappedI80F48
	borrows: WrappedI80F48
	supplyMultiplier: WrappedI80F48
	borrowMultiplier: WrappedI80F48
}

export type StateSchema = IdlAccounts<Zo>["state"] & {
	collaterals: CollateralInfo[]
	perpMarkets: PerpMarketInfo[]
}
export type MarginSchema = Omit<IdlAccounts<Zo>["margin"], "collateral"> & {
	collateral: WrappedI80F48[]
}
export type CacheSchema = IdlAccounts<Zo>["cache"] & {
	oracles: OracleCache[]
	marks: MarkCache[]
	borrowCache: BorrowCache[]
}
export type ControlSchema = IdlAccounts<Zo>["control"] & {
	openOrdersAgg: OpenOrdersInfo[]
}

export type SpecialOrdersSchema = Omit<
	IdlAccounts<Zo>["specialOrders"],
	"entries"
> & {
	entries: SpecialOrdersInfo[]
}

export type ZammSchema = IdlAccounts<ZammIdlType>["zamm"]

export enum MarginsClusterEvents {
	MarginModified = "One Margin Reloaded",
	ControlModified = "One Control Reloaded",
	MarginsReloaded = "Margins Reloaded",
}

export enum UpdateEvents {
	stateModified = "stateModified",
	_cacheModified = "_cacheModified",
	// not emitted from margin
	controlModified = "controlModified",
	marginModified = "marginModified",
	orderbookModified = "orderbookModified",
	eventQueueModified = "eventQueueModified",
	zammModified = "zammModified",
}
