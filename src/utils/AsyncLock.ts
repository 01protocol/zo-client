export class AsyncLock {
	locked = false
	_unlock: (() => void) | null = null
	private LOCK: Promise<boolean> | null = null

	get unlock() {
		if (this._unlock) {
			return this._unlock
		}
		return () => {
			//
		}
	}

	lock() {
		if (!this.locked) {
			this.locked = true
			const that = this
			this.LOCK = new Promise((res) => {
				that._unlock = () => {
					res(true)
					that.LOCK = null
					that.locked = true
				}
			})
		}
	}

	async wait() {
		if (this.LOCK) {
			await this.LOCK
		}
	}

	async waitAndLock() {
		await this.wait()
		this.lock()
	}
}
