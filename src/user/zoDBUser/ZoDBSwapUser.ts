import { ZoDBTransferUser } from "./ZoDBTransferUser";
import { AssetInfo } from "../../types/dataTypes";
import { HISTORY_ENTRIES_PER_PAGE } from "../../config";

export interface SwapHistoryEntry {
  assetInSymbol: string;
  assetInAmount: number;
  assetOutSymbol: string;
  assetOutAmount: number;
  date: Date;
}

export class ZoDBSwapUser extends ZoDBTransferUser {
  swapHistory: SwapHistoryEntry[] = [];
  swapPagesParsed = 0;
  swapCurrentPage = 0;

  async _getSwaps(page: number) {
    if (!this.realmConnected) {
      return [];
    }
    return await this.realm.functions.getUserSwapHistory({
      page: page,
      margin: this.margin.pubkey.toString(),
    });
  }

  async _insertSwaps(assets: { [key: string]: AssetInfo }) {
    while (this.swapPagesParsed <= this.swapCurrentPage) {
      const swaps = await this._getSwaps(this.swapPagesParsed);

      for (const swap of swaps) {
        const assetInSymbol = swap.assetInSymbol;
        const assetInAmount =
          Math.abs(swap.amount) / Math.pow(10, assets[assetInSymbol]!.decimals);
        const assetOutSymbol = swap.assetOutSymbol;
        const assetOutAmount =
          Math.abs(swap.amount) /
          Math.pow(10, assets[assetOutSymbol]!.decimals);
        this.swapHistory.push({
          assetInSymbol: assetInSymbol,
          assetInAmount: assetInAmount,
          assetOutSymbol: assetOutSymbol,
          assetOutAmount: assetOutAmount,
          date: new Date(swap.time * 1000),
        });
      }
      this.swapPagesParsed++;
    }
  }

  async getSwapHistory(page: number, assets: { [key: string]: AssetInfo }) {
    this.swapCurrentPage = page;
    if (this.swapHistory == null || this.swapHistory.length == 0) {
      this.swapPagesParsed = 0;
      this.swapHistory = [];
    }
    if (this.swapPagesParsed <= page) {
      await this._insertSwaps(assets);
    }
    const swapHistory: any = [];

    for (let i = 0; i < this.swapHistory.length; i++) {
      swapHistory.push(this.swapHistory[i]!);
    }

    return swapHistory.slice(
      page * HISTORY_ENTRIES_PER_PAGE,
      (page + 1) * HISTORY_ENTRIES_PER_PAGE,
    );
  }
}
