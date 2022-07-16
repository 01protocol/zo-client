/**
 * Ideally needs to be rewritten, too messy rn with a lot of old implementations which are not necessary anymore
 */

import { ZoDBPnlUser } from "./ZoDBPnlUser";
import { checkIfNewAndPush } from "./utils/checkIfNewAndPush";
import {
  ALL_MARKETS,
  FUNDING_HISTORY,
  HISTORY_ENTRIES_PER_PAGE,
} from "../../config";
import { PositionInfo } from "../../types/dataTypes";

export enum TradeHistoryEntryType {
  Trade,
  Funding,
}

export interface TradeHistoryEntry {
  price: number;
  size: number;
  isLong: boolean;
  isMaker: boolean;
  marketKey: string;
  tradeHistoryEntryType: TradeHistoryEntryType;
  date: Date;
}

export class ZoDBTradeUser extends ZoDBPnlUser {
  balanceHistory: { [key: string]: TradeHistoryEntry[] } = {};
  tradesPagesParsed: { [key: string]: number } = {};
  tradesCurrentPage: { [key: string]: number } = {};
  tradesParsed: { [key: string]: boolean } = {};
  fundingPagesParsed: { [key: string]: number } = {};
  fundingParsed: { [key: string]: boolean } = {};

  async _getTrades(page: number, marketKey: string) {
    if (!this.realmConnected) {
      return [];
    }
    return await this.realm.functions.getUserTradeHistory({
      page: page,
      control: this.margin.control.pubkey.toString(),
      market: marketKey == ALL_MARKETS ? null : marketKey,
    });
  }

  async _insertTrades(marketKey: string) {
    while (
      this.tradesPagesParsed[marketKey]! <= this.tradesCurrentPage[marketKey]!
    ) {
      const trades = await this._getTrades(
        this.tradesPagesParsed[marketKey]!,
        marketKey,
      );
      if (trades.length == 0) {
        this.tradesParsed[marketKey] = true;
      }
      for (const trade of trades) {
        checkIfNewAndPush(this.balanceHistory[trade.symbol], {
          price: trade.price,
          size: trade.size,
          isLong: trade.side == "buy",
          isMaker: trade.isMaker,
          tradeHistoryEntryType: TradeHistoryEntryType.Trade,
          marketKey: trade.symbol,
          date: new Date(trade.time * 1000),
        });
        if (marketKey == ALL_MARKETS) {
          checkIfNewAndPush(this.balanceHistory[ALL_MARKETS], {
            price: trade.price,
            size: trade.size,
            isLong: trade.side == "buy",
            isMaker: trade.isMaker,
            tradeHistoryEntryType: TradeHistoryEntryType.Trade,
            marketKey: trade.symbol,
            date: new Date(trade.time * 1000),
          });
        }
      }
      this.tradesPagesParsed[marketKey]++;
    }
  }

  async getTradesAndFunding(
    page: number,
    currentMarketKey: string,
    fundingOnly: boolean,
    allTrades: boolean,
  ) {
    const positionsArr = this.loadPositionsArr(
      this.margin.state.markets,
      this.margin.state.indexToMarketKey,
    );
    const marketKey = allTrades ? ALL_MARKETS : currentMarketKey;
    this.tradesCurrentPage[marketKey] = page;
    this._initTradeHistory(positionsArr);

    if (fundingOnly) {
      let fundings = await this._processTradesAndFunding(
        allTrades,
        positionsArr,
        fundingOnly,
        marketKey,
        page,
      );
      let tradesNotFinishedFetching = !this.tradesParsed[marketKey];
      let enoughFundingsWereNotGenerated =
        fundings.length < HISTORY_ENTRIES_PER_PAGE;
      while (tradesNotFinishedFetching && enoughFundingsWereNotGenerated) {
        this.tradesCurrentPage[marketKey]++;
        await this._insertTrades(marketKey);
        fundings = await this._processTradesAndFunding(
          allTrades,
          positionsArr,
          fundingOnly,
          marketKey,
          page,
        );
        tradesNotFinishedFetching = !this.tradesParsed[marketKey];
        enoughFundingsWereNotGenerated =
          fundings.length < HISTORY_ENTRIES_PER_PAGE;
      }
      return fundings;
    } else {
      if (
        this.tradesPagesParsed[marketKey]! <= page &&
        !this.tradesParsed[marketKey]
      ) {
        await this._insertTrades(marketKey);
      }
    }
    return await this._processTradesAndFunding(
      allTrades,
      positionsArr,
      fundingOnly,
      marketKey,
      page,
    );
  }

  private async _processTradesAndFunding(
    allTrades: boolean,
    positions: PositionInfo[],
    fundingOnly: boolean,
    marketKey: string,
    page: number,
  ): Promise<Array<any>> {
    let tradeAndFundingHistory: Array<TradeHistoryEntry>;
    if (allTrades) {
      tradeAndFundingHistory = [];
      await Promise.all(
        positions.map(
          (position) =>
            new Promise(async (res) => {
              tradeAndFundingHistory.push(
                ...(fundingOnly
                  ? await this._combineTradesAndFunding(
                      positions,
                      position.marketKey,
                      allTrades,
                    )
                  : this.balanceHistory[ALL_MARKETS]!.filter(
                      (balance) => balance.marketKey == position.marketKey,
                    ))!,
              );
              res(true);
            }),
        ),
      );
    } else {
      tradeAndFundingHistory = fundingOnly
        ? await this._combineTradesAndFunding(positions, marketKey, allTrades)
        : this.balanceHistory[marketKey]!;
    }
    tradeAndFundingHistory = tradeAndFundingHistory.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
    const filteredHistory = tradeAndFundingHistory
      .filter((entry) => entry.size != 0)
      .filter(
        (entry) =>
          fundingOnly ==
          (entry.tradeHistoryEntryType == TradeHistoryEntryType.Funding),
      );
    return filteredHistory.slice(
      Math.min(filteredHistory.length, page * HISTORY_ENTRIES_PER_PAGE),
      Math.min(filteredHistory.length, (page + 1) * HISTORY_ENTRIES_PER_PAGE),
    );
  }

  private async _combineTradesAndFunding(
    positions: PositionInfo[],
    marketKey: string,
    allTrades: boolean,
  ): Promise<TradeHistoryEntry[]> {
    const position = positions.find((pos) => pos.marketKey == marketKey)!;
    const tradeHistoryEntries = allTrades
      ? this.balanceHistory[ALL_MARKETS]!.filter(
          (balance) => balance.marketKey == position.marketKey,
        )!
      : this.balanceHistory[marketKey]!;
    if (tradeHistoryEntries.length == 1) {
      return tradeHistoryEntries;
    }
    const currentSize = (position.isLong ? 1 : -1) * position.coins.number;
    let fundingHistory: any = this.fundingHistory[marketKey]
      ? this.fundingHistory[marketKey]
      : [];
    let fundingIndex = 0;
    let rollingSize =
      Math.abs(currentSize) > 1 / 1_000_000_000 ? currentSize : 0;
    const tradeHistory: Array<TradeHistoryEntry> = [];
    const that = this;

    if (fundingHistory.length == 0 && !this.fundingParsed[marketKey]) {
      fundingHistory = await that.getFunding(marketKey);
    }

    async function pushNewFunding() {
      tradeHistory.push({
        isMaker: false,
        price: fundingHistory[fundingIndex].fundingCollected,
        size: Math.abs(rollingSize) > 1 / 1_000_000_000 ? rollingSize : 0,
        isLong: rollingSize > 0,
        tradeHistoryEntryType: TradeHistoryEntryType.Funding,
        marketKey: marketKey,
        date: fundingHistory[fundingIndex].date,
      });
      fundingIndex++;
      if (fundingIndex == fundingHistory.length) {
        fundingHistory = await that.getFunding(marketKey);
      }
    }

    for (let i = 1; i < tradeHistoryEntries.length; i++) {
      while (
        fundingHistory[fundingIndex].date.getTime() >
          tradeHistoryEntries[i]!.date.getTime() &&
        !(
          this.fundingParsed[marketKey] && fundingIndex == fundingHistory.length
        )
      ) {
        await pushNewFunding();
      }

      tradeHistory.push(tradeHistoryEntries[i]!);
      if (tradeHistoryEntries[i]!.isLong) {
        rollingSize -= tradeHistoryEntries[i]!.size;
      } else {
        rollingSize += tradeHistoryEntries[i]!.size;
      }
    }
    return tradeHistory;
  }

  private _initTradeHistory(positions: PositionInfo[]) {
    for (const position of positions) {
      const marketKey = position.marketKey;
      const currentSize = (position.isLong ? 1 : -1) * position.coins.number;
      if (
        this.balanceHistory[marketKey] == null ||
        this.balanceHistory[marketKey]!.length == 0 ||
        currentSize != this.balanceHistory[marketKey]![0]!.size
      ) {
        this.tradesPagesParsed[marketKey] = 0;
        this.tradesCurrentPage[marketKey] = 0;
        this.tradesParsed[marketKey] = false;
        this.balanceHistory[marketKey] = [
          {
            price:
              currentSize < 1 / 1_000_000_000
                ? 0
                : position.pCoins.number / position.coins.number,
            size: currentSize > 1 / 1_000_000_000 ? currentSize : 0,
            isLong: position.isLong,
            isMaker: false,
            tradeHistoryEntryType: TradeHistoryEntryType.Trade,
            marketKey: marketKey,
            date: new Date(),
          },
        ];
        this.fundingPagesParsed[position.marketKey] = 0;
      }
    }
    if (this.balanceHistory[ALL_MARKETS] == null) {
      this.tradesPagesParsed[ALL_MARKETS] = 0;
      this.tradesCurrentPage[ALL_MARKETS] = 0;
      this.balanceHistory[ALL_MARKETS] = [];
      this.tradesParsed[ALL_MARKETS] = false;
    }
    if (this.balanceHistory[FUNDING_HISTORY] == null) {
      this.tradesPagesParsed[FUNDING_HISTORY] = 0;
      this.tradesCurrentPage[FUNDING_HISTORY] = 0;
      this.balanceHistory[FUNDING_HISTORY] = [];
      this.tradesParsed[FUNDING_HISTORY] = false;
    }
  }

  fundingHistory: { [key: string]: any[] } = {};

  async getFunding(marketKey: string) {
    if (!this.realmConnected) {
      return [];
    }
    if (this.fundingParsed[marketKey]) {
      return this.fundingHistory[marketKey];
    }
    const rawFunding = await this.realm.functions.getFunding({
      market: marketKey,
      page: this.fundingPagesParsed[marketKey]!,
    });
    this.fundingPagesParsed[marketKey]!++;
    if (rawFunding.length == 0) {
      this.fundingParsed[marketKey] = true;
      return this.fundingHistory[marketKey];
    }
    const processedFunding = rawFunding.map((fundingHistoryEntry) => {
      return {
        date: new Date(fundingHistoryEntry.time * 1000),
        fundingIndex: fundingHistoryEntry.fundingIndex / 1_000_000,
        fundingCollected: 0,
        hourlyFunding:
          fundingHistoryEntry.hourly && fundingHistoryEntry.hourly * 100,
        unixTs: fundingHistoryEntry.time,
      };
    });
    if (this.fundingHistory[marketKey]) {
      const lastFundingTime =
        this.fundingHistory[marketKey]![
          this.fundingHistory[marketKey]!.length - 1
        ].date.getTime();
      for (const newEntry of processedFunding) {
        if (newEntry.date.getTime() < lastFundingTime) {
          this.fundingHistory[marketKey]!.push(newEntry);
        }
      }
    } else {
      this.fundingHistory[marketKey] = processedFunding;
    }
    let rollingFundingIndex = 1;
    for (let i = this.fundingHistory[marketKey]!.length - 1; i >= 0; i--) {
      this.fundingHistory[marketKey]![i].fundingCollected =
        this.fundingHistory[marketKey]![i].fundingIndex - rollingFundingIndex;
      rollingFundingIndex = this.fundingHistory[marketKey]![i].fundingIndex;
    }
    return this.fundingHistory[marketKey];
  }

  async getFundingByPage(marketKey: string, page: number) {
    if (!this.realmConnected) {
      return [];
    }
    const rawFunding = await this.realm.functions.getFunding({
      market: marketKey,
      page: page,
      extraOne: true,
    });
    const processedFunding = rawFunding.map((fundingHistoryEntry) => {
      return {
        date: new Date(fundingHistoryEntry.time * 1000),
        fundingIndex: fundingHistoryEntry.fundingIndex / 1_000_000,
        fundingCollected: 0,
      };
    });
    let rollingFundingIndex = 1;
    for (let i = processedFunding.length - 1; i >= 0; i--) {
      processedFunding.fundingCollected =
        processedFunding.fundingIndex - rollingFundingIndex;
      rollingFundingIndex = processedFunding.fundingIndex;
    }
    processedFunding.splice(-1, 1);
    return processedFunding;
  }
}
