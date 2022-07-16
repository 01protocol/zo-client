import { ZoDBTradeUser } from "./ZoDBTradeUser";
import { checkIfNewAndPush } from "./utils/checkIfNewAndPush";
import {
  ALL_MARKETS,
  HISTORY_ENTRIES_PER_PAGE,
  USD_DECIMALS,
} from "../../config";
import { MarketInfo } from "../../types/dataTypes";

export interface PerpLiqHistoryEntry {
  assetsTransferred: number;
  quoteTransferred: number;
  marketKey: string;
  date: Date;
}

export class ZoDBPerpLiqUser extends ZoDBTradeUser {
  perpLiqHistory: { [key: string]: PerpLiqHistoryEntry[] } = {};
  perpLiqPagesParsed: { [key: string]: number } = {};
  perpLiqCurrentPage: { [key: string]: number } = {};

  async _getPerpLiqs(page: number, marketKey: string) {
    if (!this.realmConnected) {
      return [];
    }
    const market = marketKey == ALL_MARKETS ? null : marketKey;
    return await this.realm.functions.getUserPerpLiq({
      page: page,
      margin: this.margin.pubkey.toString(),
      market,
    });
  }

  async _insertPerpLiqs(marketsDecoder: (string) => MarketInfo, marketKey) {
    while (
      this.perpLiqPagesParsed[marketKey]! <= this.perpLiqCurrentPage[marketKey]!
    ) {
      const perpLiqs = await this._getPerpLiqs(
        this.perpLiqPagesParsed[marketKey]!,
        marketKey,
      );

      for (const perpLiq of perpLiqs) {
        const assetsTransferred =
          -perpLiq.assetsToLiqor /
          Math.pow(10, marketsDecoder(perpLiq.baseSymbol).assetDecimals);
        const quoteTransferred =
          -perpLiq.quoteToLiqor / Math.pow(10, USD_DECIMALS);
        checkIfNewAndPush(this.perpLiqHistory[marketKey], {
          assetsTransferred: assetsTransferred,
          quoteTransferred: quoteTransferred,
          date: new Date(perpLiq.time * 1000),
          marketKey: perpLiq.baseSymbol,
        });
      }
      this.perpLiqPagesParsed[marketKey]++;
    }
  }

  async getPerpLiqHistory(
    page: number,
    marketsDecoder: (string) => MarketInfo,
    allMarkets: boolean,
    currentMarketKey: string,
  ) {
    const marketKey = allMarkets
      ? ALL_MARKETS
      : marketsDecoder(currentMarketKey).symbol;
    this.perpLiqCurrentPage[marketKey] = page;
    if (
      this.perpLiqHistory[marketKey] == null ||
      this.perpLiqHistory[marketKey]!.length == 0
    ) {
      this.perpLiqPagesParsed[marketKey] = 0;
      this.perpLiqCurrentPage[marketKey] = 0;
      this.perpLiqHistory[marketKey] = [];
    }
    if (this.perpLiqPagesParsed[marketKey]! <= page) {
      await this._insertPerpLiqs(marketsDecoder, marketKey);
    }
    const perpLiqHistory: Array<any> = [];

    for (let i = 0; i < this.perpLiqHistory[marketKey]!.length; i++) {
      perpLiqHistory.push(this.perpLiqHistory[marketKey]![i]!);
    }

    return perpLiqHistory.slice(
      page * HISTORY_ENTRIES_PER_PAGE,
      (page + 1) * HISTORY_ENTRIES_PER_PAGE,
    );
  }
}
