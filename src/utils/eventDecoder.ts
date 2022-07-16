import { Coder, Idl } from "@project-serum/anchor"
import { ConfirmedTransaction } from "@solana/web3.js"
import Num from "../Num"
import { DEX_IDL } from "../types/dex"
import { IDL } from "../types/zo"

export const ZO_MARK_MESSAGE = "Program log: zo-log"
export const USDC_SYMBOL = "USDC"

export enum EventNames {
  RealizedPnlLog = "RealizedPnlLog",
  DepositLog = "DepositLog",
  WithdrawLog = "WithdrawLog",
  SwapLog = "SwapLog",
}

export interface PnlLogExtraInfo {
  accountLeverage: number;
  long: boolean;
  entryPrice: number;
  symbol: string;
  contractDecimals: number;
  collateralDecimals: number;
}

export interface TransferLogExtraInfo {
  symbol: string;
  decimals: number;
}

export interface SwapLogExtraInfo {
  fromDecimals: number;
  toDecimals: number;
  fromSymbol: string;
  toSymbol: string;
}

export function processTransactionLogs({
                                         tx,
                                         extraInfo,
                                       }: {
  tx: ConfirmedTransaction
  extraInfo: PnlLogExtraInfo | TransferLogExtraInfo | SwapLogExtraInfo | object
}): EventLogData[] {
  const res: Array<EventLogData> = []
  let logMessageNow = false
  for (const logMessage of tx.meta!.logMessages!) {
    if (logMessageNow) {
      const event = getLogEventsFromEvent({
        event: logMessage,
        extraInfo,
      })
      if (event) {
        res.push(event)
      }
      logMessageNow = false
    } else if (logMessage.includes(ZO_MARK_MESSAGE)) {
      logMessageNow = true
    }
  }
  return res
}


export interface PnlLogData {
  pnl: number;
  leverage: number;
  finalPrice: number;
  sizeFilled: number;
}

export interface DepositLogData {
  depositAmount: number;
}

export interface WithdrawLogData {
  withdrawAmount: number;
}

export interface SwapLogData {
  fromAmount: number;
  toAmount: number;
}

export interface EventLogData {
  eventName: EventNames,
  data: PnlLogData | DepositLogData | WithdrawLogData | SwapLogData
}


function getLogEventsFromEvent({ event, extraInfo }): EventLogData | null {
  try {
    const decodedEvent = decodeEvent(event)
    switch (decodedEvent!.name) {
      case EventNames.RealizedPnlLog:
        // @ts-ignore
        const qtyReceived = decodedEvent.data.qtyReceived.toNumber()
        // @ts-ignore
        const qtyPaid = decodedEvent.data.qtyPaid.toNumber()
        let finalPrice, sizeFilled
        if (extraInfo.long) {
          finalPrice = Math.abs(
            (qtyReceived / qtyPaid) *
            Math.pow(
              10,
              extraInfo.collateralDecimals - extraInfo.contractDecimals,
            ),
          )
          sizeFilled = Math.abs(
            qtyPaid *
            Math.pow(
              10,
              extraInfo.contractDecimals,
            ),
          )
        } else {
          finalPrice = Math.abs(
            (qtyPaid / qtyReceived) *
            Math.pow(
              10,
              extraInfo.collateralDecimals - extraInfo.contractDecimals,
            ),
          )
          sizeFilled = Math.abs(
            qtyReceived *
            Math.pow(
              10,
              extraInfo.contractDecimals,
            ),
          )
        }
        const leverage = Math.max(1, extraInfo.accountLeverage)
        const pnl =
          leverage *
          ((((extraInfo.long ? 1 : -1) * (finalPrice - extraInfo.entryPrice)) /
              extraInfo.entryPrice) *
            100)

        return {
          eventName: EventNames.RealizedPnlLog,
          data: { pnl, leverage, finalPrice, sizeFilled },
        }
      case EventNames.DepositLog:
        const depositAmount = new Num(
          // @ts-ignore
          decodedEvent.data.depositAmount,
          extraInfo.decimals,
        ).number

        return {
          eventName: EventNames.DepositLog,
          data: { depositAmount },
        }
      case EventNames.WithdrawLog:
        const withdrawAmount = new Num(
          // @ts-ignore
          decodedEvent.data.withdrawAmount,
          extraInfo.decimals,
        ).number
        return {
          eventName: EventNames.WithdrawLog,
          data: { withdrawAmount },
        }
      case EventNames.SwapLog:
        let fromAmount, toAmount
        if (extraInfo.toSymbol == USDC_SYMBOL) {
          fromAmount = new Num(
            // @ts-ignore
            decodedEvent.data.baseDelta,
            extraInfo.fromDecimals,
          ).number
          toAmount = new Num(
            // @ts-ignore
            decodedEvent.data.quoteDelta,
            extraInfo.toDecimals,
          ).number
        } else {
          fromAmount = new Num(
            // @ts-ignore
            decodedEvent.data.quoteDelta,
            extraInfo.fromDecimals,
          ).number
          toAmount = new Num(
            // @ts-ignore
            decodedEvent.data.baseDelta,
            extraInfo.toDecimals,
          ).number
        }
        return {
          eventName: EventNames.SwapLog,
          data: { fromAmount, toAmount },
        }
    }
  } catch (_) {
    //
  }
  return null
}

function decodeMsg(coder: Coder<string>, msg: string) {
  const event = coder.events.decode(msg)
  if (event) {
    return event
  }
  return null
}

function decodeDexEvent(msg: string | undefined) {
  try {
    const coder = new Coder(DEX_IDL as Idl)
    return decodeMsg(coder, msg!)
  } catch (_) {
    return null
  }
}

function decodeZoEvent(msg: string | undefined) {
  try {
    const coder = new Coder(IDL as Idl)
    return decodeMsg(coder, msg!)
  } catch (_) {
    return null
  }
}

function decodeEvent(msgRaw: string) {
  try {
    const msg =
      msgRaw.split("Program log: ")[msgRaw.split("Program log: ").length - 1]
    const dexMsg = decodeDexEvent(msg)
    if (dexMsg) {
      return dexMsg
    }
    return decodeZoEvent(msg)
  } catch (_) {
    return null
  }
}
