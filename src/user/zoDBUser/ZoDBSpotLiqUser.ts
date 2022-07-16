import { ZoDBPerpLiqUser } from "./ZoDBPerpLiqUser";
import { AssetInfo } from "../../types/dataTypes";
import { HISTORY_ENTRIES_PER_PAGE } from "../../config";

export interface SpotLiqHistoryEntry {
  assetLiquidatedSymbol: string;
  assetLiquidatedAmount: number;
  assetSuppliedSymbol: string;
  assetSuppliedAmount: number;
  date: Date;
}

export class ZoDBSpotLiqUser extends ZoDBPerpLiqUser {
  spotLiqHistory: SpotLiqHistoryEntry[] = [];
  spotLiqPagesParsed = 0;
  spotLiqCurrentPage = 0;

  async _getSpotLiqs(page: number) {
    if (!this.realmConnected) {
      return [];
    }
    return await this.realm.functions.getUserSpotLiq({
      page: page,
      margin: this.margin.pubkey.toString(),
    });
  }

  async _insertSpotLiqs(assets: { [key: string]: AssetInfo }) {
    while (this.spotLiqPagesParsed <= this.spotLiqCurrentPage) {
      const spotLiqs = await this._getSpotLiqs(this.spotLiqPagesParsed);

      for (const spotLiq of spotLiqs) {
        const assetsTransferred =
          -spotLiq.assetsToLiqor /
          Math.pow(10, assets[spotLiq.baseSymbol]!.decimals);
        const quoteTransferred =
          -spotLiq.quoteToLiqor /
          Math.pow(10, assets[spotLiq.quoteSymbol]!.decimals);
        this.spotLiqHistory.push({
          assetSuppliedSymbol: spotLiq.baseSymbol,
          assetSuppliedAmount: assetsTransferred,
          assetLiquidatedSymbol: spotLiq.quoteSymbol,
          assetLiquidatedAmount: quoteTransferred,
          date: new Date(spotLiq.time * 1000),
        });
      }
      this.spotLiqPagesParsed++;
    }
  }

  async getSpotLiqHistory(page: number, assets: { [key: string]: AssetInfo }) {
    this.spotLiqCurrentPage = page;
    if (this.spotLiqHistory == null || this.spotLiqHistory.length == 0) {
      this.spotLiqPagesParsed = 0;
      this.spotLiqHistory = [];
    }
    if (this.spotLiqPagesParsed <= page) {
      await this._insertSpotLiqs(assets);
    }
    const spotLiqHistory: any = [];

    for (let i = 0; i < this.spotLiqHistory.length; i++) {
      spotLiqHistory.push(this.spotLiqHistory[i]);
    }

    return spotLiqHistory.slice(
      page * HISTORY_ENTRIES_PER_PAGE,
      (page + 1) * HISTORY_ENTRIES_PER_PAGE,
    );
  }
}
