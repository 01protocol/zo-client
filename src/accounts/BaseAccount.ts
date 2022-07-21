import { Commitment, PublicKey } from "@solana/web3.js"
import { Program } from "@project-serum/anchor"
import { Wallet, Zo } from "../types"
import EventEmitter from "eventemitter3"
import {
	ZERO_ONE_DEVNET_PROGRAM_ID,
	ZO_DEX_DEVNET_PROGRAM_ID,
	ZO_DEX_MAINNET_PROGRAM_ID,
} from "../config"
import { AsyncLock } from "../utils/AsyncLock"

/**
 * Base implementation for account classes.
 */
export default abstract class BaseAccount<T> {
	subscribeLastUpdate = new Date().getTime()
	subscribeTimeLimit = 0
	lastAccountSnapshotTime = new Date().getTime()

	updateAccountOnChange =
		(processUpdate, that: BaseAccount<T>) => (account, snapshotTime?) => {
			if (snapshotTime) {
				if (snapshotTime < that.lastAccountSnapshotTime) {
					return
				}
			}
			const currTime = new Date().getTime()
			const difference = currTime - that.subscribeLastUpdate
			if (difference < that.subscribeTimeLimit) {
				setTimeout(() => {
					that.updateAccountOnChange(processUpdate, that)(
						account,
						currTime,
					)
				}, that.subscribeTimeLimit + that.subscribeLastUpdate - currTime)
				return
			}
			that.subscribeLastUpdate = currTime
			if (snapshotTime) {
				that.lastAccountSnapshotTime = snapshotTime
			} else {
				that.lastAccountSnapshotTime = currTime
			}
			processUpdate(account)
		}

	protected backupSubscriberChannel: number | undefined
	protected subLock = new AsyncLock()

	protected constructor(
		private _program: Program<Zo>,
		public readonly pubkey: PublicKey,
		public data: Readonly<T>,
		protected readonly commitment: Commitment = "processed",
	) {}

	getDexProgram() {
		return this.program.programId.equals(ZERO_ONE_DEVNET_PROGRAM_ID)
			? ZO_DEX_DEVNET_PROGRAM_ID
			: ZO_DEX_MAINNET_PROGRAM_ID
	}

	protected async _subscribe(
		accountName: string,
		withBackup = false,
		programPassed?: Program<any>,
	) {
		const program = programPassed ? programPassed : this.program
		const eventEmitterMain = await program.account[
			accountName.toLowerCase()
		].subscribe(this.pubkey, this.commitment)
		if (
			!withBackup &&
			(this.commitment == "confirmed" || this.commitment == "finalized")
		) {
			return eventEmitterMain
		}
		this.backupSubscriberChannel =
			program.provider.connection.onAccountChange(
				this.pubkey,
				async (serializedAccount) => {
					const account = await program.account[
						accountName
					].coder.accounts.decode(accountName, serializedAccount.data)
					eventEmitter.emit("change", account)
				},
				"confirmed",
			)
		const eventEmitter = new EventEmitter()
		eventEmitterMain.addListener("change", async (account) => {
			eventEmitter.emit("change", account)
		})
		return eventEmitter
	}

	get program() {
		return this._program
	}

	get provider() {
		return this.program.provider
	}

	get connection() {
		return this.provider.connection
	}

	get wallet(): Wallet {
		return this.provider.wallet
	}

	abstract refresh(): Promise<void>
}
