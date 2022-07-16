import { SwapHistoryEntry, ZoDBSwapUser } from "./ZoDBSwapUser";
import { PnlHistoryEntry } from "./ZoDBPnlUser";
import { SpotLiqHistoryEntry } from "./ZoDBSpotLiqUser";
import { TradeHistoryEntry, TradeHistoryEntryType } from "./ZoDBTradeUser";
import { PerpLiqHistoryEntry } from "./ZoDBPerpLiqUser";
import { TransferHistoryEntry } from "./ZoDBTransferUser";

export class ZoDBUser extends ZoDBSwapUser {}

export type { PnlHistoryEntry };
export type { TradeHistoryEntry };
export type { SpotLiqHistoryEntry };
export type { PerpLiqHistoryEntry };
export type { TransferHistoryEntry };
export type { SwapHistoryEntry };
export { TradeHistoryEntryType };
