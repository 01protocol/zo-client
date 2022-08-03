import {
	ConfirmedTransaction,
	ConfirmOptions,
	Connection,
	Finality,
	Keypair,
	PublicKey,
	SystemProgram,
	Transaction,
	TransactionInstruction,
} from "@solana/web3.js"
import {
	AccountLayout as TokenAccountLayout,
	AccountLayout,
	ASSOCIATED_TOKEN_PROGRAM_ID,
	MintInfo,
	MintLayout,
	Token,
	TOKEN_PROGRAM_ID,
	u64,
} from "@solana/spl-token"
import { AnchorProvider, Program } from "@project-serum/anchor"
import BN from "bn.js"
import Decimal from "decimal.js"
import { blob, struct, u8 } from "buffer-layout"
import { Wallet, Zo } from "../types"
import {
	IDL,
	RENT_PROGRAM_ID,
	WRAPPED_SOL_MINT,
	ZERO_ONE_DEVNET_PROGRAM_ID,
	ZERO_ONE_MAINNET_PROGRAM_ID,
} from "../config"
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes"
import { OrderInfo, PositionInfo } from "../types/dataTypes"

export * from "../types/dataTypes"

export * from "./rpc"
export * from "./units"
export * from "./eventDecoder"
export { AsyncLock } from "./AsyncLock"

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export enum Cluster {
	Devnet = "Devnet",
	Mainnet = "Mainnet",
}

export function createProvider(
	conn: Connection,
	wallet: Wallet,
	opts: ConfirmOptions = {},
): AnchorProvider {
	return new AnchorProvider(conn, wallet, opts)
}

export function arePositionsEqual(a: PositionInfo, b: PositionInfo) {
	if (!a.coins.decimal.eq(b.coins.decimal)) {
		return false
	}
	if (!a.pCoins.decimal.eq(b.pCoins.decimal)) {
		return false
	}
	if (!a.realizedPnL.decimal.eq(b.realizedPnL.decimal)) {
		return false
	}
	if (!a.fundingIndex.eq(b.fundingIndex)) {
		return false
	}
	if (a.isLong != b.isLong) {
		return false
	}
	if (a.marketKey != b.marketKey) {
		return false
	}
	return true
}

export enum OrderChangeStatus {
	Changed,
	Missing,
	Present,
}

export function getOrderStatus(
	a: OrderInfo,
	arr: OrderInfo[],
): OrderChangeStatus {
	for (const b of arr) {
		if (a.orderId.toString() == b.orderId.toString()) {
			if (!areOrdersEqual(a, b)) {
				return OrderChangeStatus.Changed
			} else {
				return OrderChangeStatus.Present
			}
		}
	}
	return OrderChangeStatus.Missing
}

export function areOrdersEqual(a: OrderInfo, b: OrderInfo) {
	if (!a.coins.decimal.eq(b.coins.decimal)) {
		return false
	}
	if (!a.pCoins.decimal.eq(b.pCoins.decimal)) {
		return false
	}
	if (!a.price.decimal.eq(b.price.decimal)) {
		return false
	}
	if (!a.orderId.eq(b.orderId)) {
		return false
	}
	if (a.long != b.long) {
		return false
	}
	if (a.symbol != b.marketKey) {
		return false
	}
	return true
}

export async function getConfirmedTransaction(
	connection: Connection,
	txId: string,
	finality: Finality,
): Promise<ConfirmedTransaction> {
	let tx
	while (tx == null) {
		tx = await connection.getTransaction(txId, { commitment: finality })
		await sleep(200)
	}
	return tx
}

export function getKeypairFromSecretKey(SECRET_KEY) {
	try {
		return Keypair.fromSecretKey(
			Uint8Array.from(SECRET_KEY.split(",").map((el) => parseInt(el))),
		)
	} catch (_) {
		return Keypair.fromSecretKey(bs58.decode(SECRET_KEY))
	}
}

export function createProgram(
	provider: AnchorProvider,
	cluster: Cluster,
): Program<Zo> {
	if (cluster === Cluster.Devnet) {
		return new Program<Zo>(IDL, ZERO_ONE_DEVNET_PROGRAM_ID, provider)
	} else {
		return new Program<Zo>(IDL, ZERO_ONE_MAINNET_PROGRAM_ID, provider)
	}
}

export function getClusterFromZoProgram(program: Program<Zo>) {
	if (
		program.programId.toString() == ZERO_ONE_MAINNET_PROGRAM_ID.toString()
	) {
		return Cluster.Mainnet
	}
	return Cluster.Devnet
}

export function loadWI80F48({ data }: { data: BN }): Decimal {
	return new Decimal(
		`${data.isNeg() ? "-" : ""}0b${data.abs().toString(2)}p-48`,
	)
}

const utf8Decoder = new TextDecoder("utf-8")

export function loadSymbol({ data: s }: { data: number[] }): string {
	// Need to convert symbol, which is a [u8; 24], to a JS String.
	// Can't use String.fromCodePoint since that takes in u16,
	// when we are receiving a UTF-8 byte array.
	let i = s.indexOf(0)
	i = i < 0 ? s.length : i
	return utf8Decoder.decode(new Uint8Array(s.slice(0, i)))
}

/**
 * Instead of returning -1 if the element is not found,
 * return `array.length`. Much easier to use for slicing.
 */
export function findIndexOf<T>(l: readonly T[], p: (T) => boolean) {
	for (let i = 0; i < l.length; ++i) {
		if (p(l[i])) {
			return i
		}
	}
	return l.length
}

export function findLastIndexOf<T>(l: readonly T[], p: (T) => boolean) {
	for (let i = l.length - 1; i >= 0; --i) {
		if (p(l[i])) {
			return i
		}
	}
	return -1
}

export async function getMintInfo(
	provider: AnchorProvider,
	pubkey: PublicKey,
): Promise<MintInfo> {
	const data = (await provider.connection.getAccountInfo(pubkey))?.data
	if (!data) throw Error(`Couldn't load mint data for ${pubkey.toBase58()}`)
	const m = MintLayout.decode(data)
	return {
		mintAuthority: new PublicKey(m.mintAuthority),
		supply: u64.fromBuffer(m.supply),
		decimals: m.decimals,
		isInitialized: !!m.isInitialized,
		freezeAuthority: new PublicKey(m.freezeAuthority),
	}
}

export async function createMintIxs(
	mint: Keypair,
	provider: AnchorProvider,
	authority: PublicKey,
	decimals: number,
	freezeAuthority?: PublicKey,
): Promise<TransactionInstruction[]> {
	return [
		SystemProgram.createAccount({
			fromPubkey: provider.publicKey!,
			newAccountPubkey: mint.publicKey,
			space: MintLayout.span,
			lamports: await Token.getMinBalanceRentForExemptMint(
				provider.connection,
			),
			programId: TOKEN_PROGRAM_ID,
		}),
		Token.createInitMintInstruction(
			TOKEN_PROGRAM_ID,
			mint.publicKey,
			decimals,
			authority,
			freezeAuthority ?? null,
		),
	]
}

export async function createTokenAccountIxs(
	vault: Keypair,
	provider: AnchorProvider,
	mint: PublicKey,
	owner: PublicKey,
): Promise<TransactionInstruction[]> {
	return [
		SystemProgram.createAccount({
			fromPubkey: provider.publicKey!,
			newAccountPubkey: vault.publicKey,
			space: AccountLayout.span,
			lamports: await Token.getMinBalanceRentForExemptAccount(
				provider.connection,
			),
			programId: TOKEN_PROGRAM_ID,
		}),
		Token.createInitAccountInstruction(
			TOKEN_PROGRAM_ID,
			mint,
			vault.publicKey,
			owner,
		),
	]
}

export function createMintToIxs(
	mint: PublicKey,
	dest: PublicKey,
	authority: PublicKey,
	amount: number,
): TransactionInstruction[] {
	return [
		Token.createMintToInstruction(
			TOKEN_PROGRAM_ID,
			mint,
			dest,
			authority,
			[],
			amount,
		),
	]
}

export async function createMint(
	provider: AnchorProvider,
	authority: PublicKey,
	decimals: number,
	freezeAuthority?: PublicKey,
): Promise<PublicKey> {
	const mint = new Keypair()
	const tx = new Transaction()
	tx.add(
		...(await createMintIxs(
			mint,
			provider,
			authority,
			decimals,
			freezeAuthority,
		)),
	)
	await provider.sendAll([{ tx, signers: [mint] }])
	return mint.publicKey
}

export async function createTokenAccount(
	provider: AnchorProvider,
	mint: PublicKey,
	owner: PublicKey,
): Promise<PublicKey> {
	const vault = Keypair.generate()
	const tx = new Transaction()
	tx.add(...(await createTokenAccountIxs(vault, provider, mint, owner)))
	await provider.sendAll([{ tx, signers: [vault] }])
	return vault.publicKey
}

export async function findAssociatedTokenAddress(
	walletAddress: PublicKey,
	tokenMintAddress: PublicKey,
): Promise<PublicKey> {
	return (
		await PublicKey.findProgramAddress(
			[
				walletAddress.toBuffer(),
				TOKEN_PROGRAM_ID.toBuffer(),
				tokenMintAddress.toBuffer(),
			],
			ASSOCIATED_TOKEN_PROGRAM_ID,
		)
	)[0]
}

export function getAssociatedTokenTransactionWithPayer(
	tokenMintAddress: PublicKey,
	associatedTokenAddress: PublicKey,
	owner: PublicKey,
) {
	const keys = [
		{
			pubkey: owner,
			isSigner: true,
			isWritable: true,
		},
		{
			pubkey: associatedTokenAddress,
			isSigner: false,
			isWritable: true,
		},
		{
			pubkey: owner,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: tokenMintAddress,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: SystemProgram.programId,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: TOKEN_PROGRAM_ID,
			isSigner: false,
			isWritable: false,
		},
		{
			pubkey: RENT_PROGRAM_ID,
			isSigner: false,
			isWritable: false,
		},
	]

	return new TransactionInstruction({
		keys,
		programId: ASSOCIATED_TOKEN_PROGRAM_ID,
		data: Buffer.from([]),
	})
}

export async function mintTo(
	provider: AnchorProvider,
	mint: PublicKey,
	dest: PublicKey,
	amount: number,
): Promise<void> {
	const tx = new Transaction()
	tx.add(...createMintToIxs(mint, dest, provider.publicKey, amount))
	await provider.sendAll([{ tx, signers: [] }])
}

export function throwIfNull<T>(
	value: T | null,
	message = "account not found",
): T {
	if (value === null) {
		throw new Error(message)
	}
	return value
}

const MINT_LAYOUT = struct([blob(44), u8("decimals"), blob(37)])

export async function getMintDecimals(
	connection: Connection,
	mint: PublicKey,
): Promise<number> {
	if (mint.equals(WRAPPED_SOL_MINT)) {
		return 9
	}
	const { data } = throwIfNull(
		await connection.getAccountInfo(mint),
		"mint not found",
	)
	const { decimals } = MINT_LAYOUT.decode(data)
	return decimals
}

export async function getWrappedSolInstructionsAndKey(
	initialSmollAmount,
	provider,
): Promise<{
	createTokenAccountIx: TransactionInstruction
	initTokenAccountIx: TransactionInstruction
	closeTokenAccountIx: TransactionInstruction
	intermediary: PublicKey
	intermediaryKeypair: Keypair
}> {
	// sol wrapping code taken from jet: https://github.com/jet-lab/jet-v1/blob/30c56d5c14b68685466164fc45c96080f1d9348a/app/src/scripts/jet.ts
	const intermediaryKeypair = Keypair.generate()
	const intermediary = intermediaryKeypair.publicKey

	const rent = await provider.connection.getMinimumBalanceForRentExemption(
		TokenAccountLayout.span,
	)
	const createTokenAccountIx = SystemProgram.createAccount({
		fromPubkey: provider.publicKey,
		newAccountPubkey: intermediary,
		programId: TOKEN_PROGRAM_ID,
		space: TokenAccountLayout.span,
		lamports: parseInt(initialSmollAmount.addn(rent).toString()),
	})

	const initTokenAccountIx = Token.createInitAccountInstruction(
		TOKEN_PROGRAM_ID,
		WRAPPED_SOL_MINT,
		intermediary,
		provider.publicKey,
	)

	const closeTokenAccountIx = Token.createCloseAccountInstruction(
		TOKEN_PROGRAM_ID,
		intermediary,
		provider.publicKey,
		provider.publicKey,
		[],
	)

	return {
		createTokenAccountIx,
		initTokenAccountIx,
		closeTokenAccountIx,
		intermediary,
		intermediaryKeypair,
	}
}

export function walletFromKeyPair(keypair: Keypair): Wallet {
	return {
		publicKey: keypair.publicKey,
		signTransaction: async (tx) => {
			await tx.sign(keypair)
			return tx
		},
		signAllTransactions: async (txs) => {
			for (const tx of txs) {
				await tx.sign(keypair)
			}
			return txs
		},
	}
}
