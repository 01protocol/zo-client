import { ZoDBSpotLiqUser } from "./ZoDBSpotLiqUser"
import { AssetInfo } from "../../types/dataTypes"
import { HISTORY_ENTRIES_PER_PAGE } from "../../config"

export interface TransferHistoryEntry {
  assetSymbol: string;
  amount: number;
  deposit: boolean;
  date: Date;
}

export class ZoDBTransferUser extends ZoDBSpotLiqUser {
  transferHistory: TransferHistoryEntry[] = []
  transferPagesParsed = 0
  transferCurrentPage = 0

  async _getTransfers(page: number) {
    if (!this.realmConnected) {
      return []
    }
    return await this.realm.functions.getUserTransferHistory({
      page: page,
      margin: this.margin.pubkey.toString(),
    })
  }

  async _insertTransfers(assets: { [key: string]: AssetInfo }) {
    while (this.transferPagesParsed <= this.transferCurrentPage) {
      const transfers = await this._getTransfers(this.transferPagesParsed)

      for (const transfer of transfers) {
        const symbol = transfer.symbol
        const amount =
          Math.abs(transfer.amount) / Math.pow(10, assets[symbol]!.decimals)
        const deposit = transfer.amount > 0
        this.transferHistory.push({
          assetSymbol: symbol,
          amount: amount,
          deposit: deposit,
          date: new Date(transfer.time * 1000),
        })
      }
      this.transferPagesParsed++
    }
  }

  async getTransferHistory(
    page: number,
    assets: { [key: string]: AssetInfo },
  ): Promise<TransferHistoryEntry[]> {
    this.transferCurrentPage = page
    if (this.transferHistory == null || this.transferHistory.length == 0) {
      this.transferPagesParsed = 0
      this.transferHistory = []
    }
    if (this.transferPagesParsed <= page) {
      await this._insertTransfers(assets)
    }
    const transferHistory: Array<any> = []

    for (let i = 0; i < this.transferHistory.length; i++) {
      transferHistory.push(this.transferHistory[i])
    }

    return transferHistory.slice(
      page * HISTORY_ENTRIES_PER_PAGE,
      (page + 1) * HISTORY_ENTRIES_PER_PAGE,
    )
  }
}
