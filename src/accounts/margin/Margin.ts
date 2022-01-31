import { PublicKey } from "@solana/web3.js";
import { Program, ProgramAccount } from "@project-serum/anchor";
import State from "../state/State";
import Num from "../../Num";
import Decimal from "decimal.js";
import { PositionInfo, TradeInfo } from "../../types/dataTypes";
import MarginWeb3 from "./MarginWeb3";
import { Zo } from "../../types/zo";
import Cache from "../Cache";
import { ControlSchema, MarginSchema } from "../../types";

/**
 * The margin account is a PDA generated using
 * ```javascript
 * seeds=[userWalletKey, stateKey, "marginv1"]
 * ```.
 */
export default abstract class Margin extends MarginWeb3 {
  static async load(
    program: Program<Zo>,
    st: State,
    ch: Cache,
    owner?: PublicKey,
  ): Promise<Margin> {
    return (await super.load(program, st, ch, owner)) as Margin;
  }

  static async loadPrefetched(
    program: Program<Zo>,
    st: State,
    ch: Cache,
    prefetchedMarginData: ProgramAccount<MarginSchema>,
    prefetchedControlData: ProgramAccount<ControlSchema>,
    withOrders: boolean,
  ): Promise<Margin> {
    return (await super.loadPrefetched(
      program,
      st,
      ch,
      prefetchedMarginData,
      prefetchedControlData,
      withOrders,
    )) as Margin;
  }

  static async loadAllMargins(
    program: Program<Zo>,
    st: State,
    ch: Cache,
    verbose = false,
    withOrders = true,
  ) {
    const marginAndControlSchemas = await this.loadAllMarginAndControlSchemas(
      program,
    );
    const margins: Margin[] = [];
    console.log(marginAndControlSchemas.length, " schemas loaded");
    const len = marginAndControlSchemas.length;
    let index = 0;
    if (verbose) this.printMarginsLoadProgress(index, len);
    for (const marginAndControlSchema of marginAndControlSchemas) {
      index++;
      margins.push(
        await this.loadPrefetched(
          program,
          st,
          ch,
          marginAndControlSchema.marginSchema,
          marginAndControlSchema.controlSchema,
          withOrders,
        ),
      );
      if (verbose) this.printMarginsLoadProgress(index, len);
    }
    if (verbose) {
      this.printMarginsLoadProgress(index, len);
      console.log();
    }
    return margins;
  }

  private static printMarginsLoadProgress(index: number, len: number) {
    const size = 21;
    const i = (index * size) / len;
    const dots = ".".repeat(i);
    const left = size - i;
    const empty = " ".repeat(left);
    process.stdout.write(
      `\r[${dots}${empty}] ${((i * 100) / size).toFixed(
        2,
      )}% ${index}/${len} Loaded`,
    );
  }

  /**
   * Math stuff below:
   */

  // Positions Info

  position(marketKey: string) {
    return this.positions.find((el) => el.marketKey === marketKey)!;
  }

  get positionInfos() {
    const posInfos = {};
    for (const marketKey of Object.keys(this.state.markets)) {
      posInfos[marketKey] = {
        long: new Decimal(0),
        short: new Decimal(0),
        posSize: new Decimal(0),
        isLong: false,
      };
    }
    for (const position of this.positions) {
      posInfos[position.marketKey].posSize = position.coins.decimal;
      posInfos[position.marketKey].isLong = position.isLong;
      if (position.isLong) {
        posInfos[position.marketKey].long = position.coins.decimal;
      } else {
        posInfos[position.marketKey].short = position.coins.decimal;
      }
    }

    for (const order of this.orders) {
      if (order.long) {
        posInfos[order.marketKey].long = posInfos[order.marketKey].long.add(
          order.coins.decimal,
        );
      } else {
        posInfos[order.marketKey].short = posInfos[order.marketKey].short.add(
          order.coins.decimal,
        );
      }
    }

    return posInfos;
  }

  // pnL & funding info

  positionPnL(position: PositionInfo): Decimal {
    const market = this.state.markets[position.marketKey]!;
    const diff = position.coins.decimal
      .mul(market.markPrice.decimal)
      .sub(position.pCoins.decimal);

    if (position.isLong) return diff;
    return diff.mul(-1);
  }

  get cumulativePnL() {
    let totalPnL = new Decimal(0);
    for (const position of this.positions) {
      totalPnL = totalPnL.add(this.positionPnL(position));
    }

    return totalPnL;
  }

  get realizedPnL() {
    let realizedPnL = new Decimal(0);
    for (const position of this.positions) {
      realizedPnL = realizedPnL.add(position.realizedPnL.number);
    }
    return realizedPnL;
  }

  get funding() {
    let funding = new Decimal(0);
    for (const position of this.positions) {
      if (position.isLong) {
        const fundingDifference = this.state.markets[
          position.marketKey
        ]!.fundingIndex.sub(position.fundingIndex);
        funding = funding.sub(position.coins.decimal.mul(fundingDifference));
      } else {
        const fundingDifference = this.state.markets[
          position.marketKey
        ]!.fundingIndex.sub(position.fundingIndex);
        funding = funding.add(position.coins.decimal.mul(fundingDifference));
      }
    }
    return funding;
  }

  positionFunding(position: PositionInfo) {
    let funding = new Decimal(0);
    if (position.isLong) {
      const fundingDifference = this.state.markets[
        position.marketKey
      ]!.fundingIndex.sub(position.fundingIndex);
      funding = funding.sub(position.coins.decimal.mul(fundingDifference));
    } else {
      const fundingDifference = this.state.markets[
        position.marketKey
      ]!.fundingIndex.sub(position.fundingIndex);
      funding = funding.add(position.coins.decimal.mul(fundingDifference));
    }
    return funding;
  }

  // balances info

  get balances() {
    const balances: any = { ...this._balances };
    balances["USDC"] = new Num(
      this._balances["USDC"]!.decimal.add(this.realizedPnL).add(this.funding),
      this._balances["USDC"]!.decimals,
    );
    return balances;
  }

  get depositedCollateralValue() {
    let depositedCollateral = new Decimal(0);
    for (const asset of Object.values(this.state.assets)) {
      //@ts-ignore
      if (this.balances[asset.symbol]) {
        depositedCollateral = depositedCollateral.add(
          //@ts-ignore
          this.balances[asset.symbol].decimal.mul(asset.indexPrice.decimal),
        );
      }
    }
    return depositedCollateral;
  }

  // collateral info

  get weightedCollateralValue() {
    let depositedCollateral = new Decimal(0);
    for (const assetKey of Object.keys(this.balances)) {
      if (this.balances[assetKey].number >= 0) {
        depositedCollateral = depositedCollateral.add(
          this.balances[assetKey].decimal
            .mul(this.state.assets[assetKey]!.indexPrice.decimal)
            .mul(this.state.assets[assetKey]!.weight / 1000),
        );
      } else {
        depositedCollateral = depositedCollateral.add(
          this.balances[assetKey].decimal.mul(
            this.state.assets[assetKey]!.indexPrice.decimal,
          ),
        );
      }
    }

    return depositedCollateral;
  }

  get unweightedCollateralValue() {
    let depositedCollateral = new Decimal(0);
    for (const marketKey of Object.keys(this.balances)) {
      if (this.balances[marketKey].number >= 0) {
        depositedCollateral = depositedCollateral.add(
          this.balances[marketKey].decimal.mul(
            this.state.assets[marketKey]!.indexPrice.decimal,
          ),
        );
      } else {
        depositedCollateral = depositedCollateral.add(
          this.balances[marketKey].decimal.mul(
            this.state.assets[marketKey]!.indexPrice.decimal,
          ),
        );
      }
    }

    return depositedCollateral;
  }

  get borrowLendingTiedCollateralValue() {
    let tiedCollateral = new Decimal(0);
    for (const marketKey of Object.keys(this.balances)) {
      if (this.balances[marketKey].number < 0) {
        const borrowNotional = this.balances[marketKey].decimal.mul(
          this.state.assets[marketKey]!.indexPrice.decimal,
        );
        tiedCollateral = tiedCollateral.add(
          new Decimal(1.1)
            .div(this.state.assets[marketKey]!.weight / 1000)
            .minus(1)
            .mul(borrowNotional.abs()),
        );
      }
    }
    return tiedCollateral;
  }

  get lendingPositionNotionalValue() {
    let bnlPositionNotional = new Decimal(0);
    for (const marketKey of Object.keys(this.balances)) {
      if (this.balances[marketKey].number < 0) {
        bnlPositionNotional = bnlPositionNotional.add(
          this.balances[marketKey].decimal.mul(
            this.state.assets[marketKey]!.indexPrice.decimal,
          ),
        );
      }
    }
    return bnlPositionNotional.abs();
  }

  get collateralInitialMarginInfo(): [Decimal, Decimal] {
    let [imfWeightedTotal, imfWeight] = [new Decimal(0), new Decimal(0)];

    for (const marketKey of Object.keys(this.balances)) {
      if (this.balances[marketKey].number < 0) {
        const factor = new Decimal(1.1)
          .div(this.state.assets[marketKey]!.weight / 1000)
          .minus(new Decimal(1));
        const weight = this.balances[marketKey].decimal.mul(
          this.state.assets[marketKey]!.indexPrice.decimal,
        );
        imfWeightedTotal = imfWeightedTotal.add(weight.mul(factor));
        imfWeight = imfWeight.add(weight);
      }
    }
    return [imfWeightedTotal.abs(), imfWeight.abs()];
  }

  private getWeightedBorrow(marketKey: string) {
    const factor = new Decimal(1.03)
      .div(this.state.assets[marketKey]!.weight / 1000)
      .minus(new Decimal(1));
    const weight = this.balances[marketKey].decimal
      .mul(this.state.assets[marketKey]!.indexPrice.decimal)
      .abs();
    const weightedBorrow = weight.mul(factor);
    return { weight, weightedBorrow };
  }

  get collateralMaintenanceMarginInfo(): [Decimal, Decimal] {
    let [mmfWeightedTotal, mmfWeight] = [new Decimal(0), new Decimal(0)];
    for (const marketKey of Object.keys(this.balances)) {
      if (this.balances[marketKey].number < 0) {
        const { weight, weightedBorrow } = this.getWeightedBorrow(marketKey);
        mmfWeightedTotal = mmfWeightedTotal.add(weightedBorrow);
        mmfWeight = mmfWeight.add(weight);
      }
    }

    return [mmfWeightedTotal.abs(), mmfWeight.abs()];
  }

  // margin info

  get accountValue() {
    return this.weightedCollateralValue.add(this.cumulativePnL);
  }

  get unweightedAccountValue() {
    return this.unweightedCollateralValue.add(this.cumulativePnL);
  }

  get totalPositionNotional() {
    let res = new Decimal(0);
    for (const position of this.positions) {
      const market = this.state.markets[position.marketKey]!;
      const size = position.coins.decimal.mul(market.markPrice.decimal);
      res = res.add(size);
    }
    return res.add(this.lendingPositionNotionalValue);
  }

  get totalOpenPositionNotional() {
    let res = new Decimal(0);
    for (const order of this.orders) {
      const market = this.state.markets[order.marketKey]!;

      const size = order.coins.decimal.mul(market.markPrice.decimal);
      res = res.add(size);
    }
    return res.add(this.totalPositionNotional);
  }

  positionWeighted(marketKey: string) {
    const posNotional = this.positionInfos[marketKey].posSize.mul(
      this.state.markets[marketKey]!.markPrice.decimal,
    );
    const pmmf = this.state.markets[marketKey]!.pmmf;
    const positionWeighted = pmmf.mul(posNotional);
    return { posNotional, positionWeighted };
  }

  get maintenanceMarginFraction() {
    let [mmfWeightedTotal, mmfWeight] = this.collateralMaintenanceMarginInfo;

    for (const marketKey of Object.keys(this.state.markets)) {
      const { posNotional, positionWeighted } =
        this.positionWeighted(marketKey);

      mmfWeight = mmfWeight.add(posNotional);
      mmfWeightedTotal = mmfWeightedTotal.add(positionWeighted);
    }

    if (mmfWeight.toNumber() === 0) {
      return new Decimal(0);
    }

    return mmfWeightedTotal.div(mmfWeight);
  }

  initialMarginFraction(trade?) {
    let [imfWeightedTotal, imfWeight] = this.collateralInitialMarginInfo;

    for (const marketKey of Object.keys(this.state.markets)) {
      let addOn = this.positionInfos[marketKey].posSize;
      if (trade && marketKey == trade.marketKey) {
        addOn = this.positionInfos[marketKey].posSize
          .mul(this.positionInfos[marketKey].isLong ? 1 : -1)
          .add(trade.coins * (trade.long ? 1 : -1))
          .abs();
      }
      const posNotional = addOn.mul(
        this.state.markets[marketKey]!.markPrice.decimal,
      );
      imfWeight = imfWeight.add(posNotional);
      const pimf = this.state.markets[marketKey]!.pmmf.mul(2);
      imfWeightedTotal = imfWeightedTotal.add(pimf.mul(posNotional));
    }

    if (imfWeight.toNumber() === 0) {
      return new Decimal(0);
    }
    return imfWeightedTotal.div(imfWeight);
  }

  initialMarginFractionUnweighted(trade?) {
    let [imfWeightedTotal, imfWeight] = this.collateralInitialMarginInfo;

    for (const marketKey of Object.keys(this.state.markets)) {
      let addOn = this.positionInfos[marketKey].posSize;
      if (trade && marketKey == trade.marketKey) {
        addOn = this.positionInfos[marketKey].posSize
          .mul(this.positionInfos[marketKey].isLong ? 1 : -1)
          .add(trade.coins * (trade.long ? 1 : -1))
          .abs();
      }
      const posNotional = addOn.mul(
        this.state.markets[marketKey]!.markPrice.decimal,
      );
      imfWeight = imfWeight.add(posNotional);
      const pimf = this.state.markets[marketKey]!.pmmf.mul(2);
      imfWeightedTotal = imfWeightedTotal.add(pimf.mul(posNotional));
    }

    if (imfWeight.toNumber() === 0) {
      return new Decimal(0);
    }
    return imfWeightedTotal;
  }

  get openMarginFraction() {
    if (this.totalOpenPositionNotional.toNumber() == 0) {
      return new Decimal(1);
    }
    return Decimal.min(this.accountValue, this.weightedCollateralValue).div(
      this.totalOpenPositionNotional,
    );
  }

  get marginFraction() {
    if (this.totalPositionNotional.toNumber() === 0) {
      return new Decimal(1);
    }

    return this.accountValue.div(this.totalPositionNotional);
  }

  // borrow/Lending info

  get positionsTiedCollateral() {
    const posInfos = this.positionInfos;

    let tiedCollateral = new Decimal(0);
    for (const marketKey of Object.keys(this.state.markets)) {
      const posNotional = posInfos[marketKey].posSize.mul(
        this.state.markets[marketKey]!.markPrice.decimal,
      );
      const openSize = Decimal.max(
        posInfos[marketKey].long,
        posInfos[marketKey].short,
      );
      tiedCollateral = tiedCollateral.add(
        this.state.markets[marketKey]!.baseImf.mul(openSize.add(posNotional)),
      );
    }
    return tiedCollateral;
  }

  get tiedCollateral() {
    return this.borrowLendingTiedCollateralValue.add(
      this.positionsTiedCollateral,
    );
  }

  get freeCollateralValue() {
    const freeCollateral = Decimal.min(
      this.accountValue,
      this.weightedCollateralValue,
    ).minus(this.tiedCollateral);
    return Decimal.max(new Decimal(0), freeCollateral);
  }

  collateralWithdrawable(assetKey: string) {
    const balance = this.balances[assetKey].decimal;
    if (this.state.assets[assetKey]) {
      let res = Decimal.max(
        0,
        Decimal.min(
          balance,
          this.freeCollateralValue
            .div(this.state.assets[assetKey]!.indexPrice.decimal)
            .div(this.state.assets[assetKey]!.weight / 1000),
        ),
      );

      if (res.toNumber() != balance) {
        const VALUE_NERF = 0.02;
        res = res.mul(1 - VALUE_NERF);
      }
      return res;
    }
    return new Decimal(0);
  }

  collateralWithdrawableWithBorrow(assetKey: string) {
    if (this.state.assets[assetKey]) {
      const availableFreeWithdrawalNotional = this.collateralWithdrawable(
        assetKey,
      ).mul(this.state.assets[assetKey]!.indexPrice.decimal);
      const factor = new Decimal(1.1)
        .div(this.state.assets[assetKey]!.weight / 1000)
        .minus(new Decimal(1));

      const availableToBorrow = this.freeCollateralValue
        .minus(availableFreeWithdrawalNotional)
        .div(new Decimal(1).plus(factor))
        .div(this.state.assets[assetKey]!.indexPrice.decimal);
      const VALUE_NERF = 0.02;
      return availableToBorrow
        .add(this.collateralWithdrawable(assetKey))
        .mul(1 - VALUE_NERF);
    }
    return new Decimal(0);
  }

  // trade margin info

  maxContractsPurchaseable(trade: TradeInfo) {
    const marketInfo = this.state.markets[trade.marketKey]!;
    const markPrice = marketInfo.markPrice;
    const TAKER_TRADE_FEE = 0.1;
    const MAKER_TRADE_FEE = 0.0;
    //decrease max amounts to account for price fluctuations and on-chain approximations
    const VALUE_NERF = 0.02;
    const feeMultiplier = trade.postOrder
      ? 1 - MAKER_TRADE_FEE - VALUE_NERF
      : 1 - TAKER_TRADE_FEE - VALUE_NERF;

    if (this.totalOpenPositionNotional.toNumber() === 0) {
      return Decimal.min(this.accountValue, this.weightedCollateralValue)
        .div(marketInfo.baseImf)
        .mul(
          trade.postOrder
            ? 1 - MAKER_TRADE_FEE - VALUE_NERF
            : 1 - TAKER_TRADE_FEE - VALUE_NERF,
        )
        .div(markPrice.decimal)
        .toNumber();
    }
    const changeInOpenSizeAllowed = this.openMarginFraction
      .minus(this.initialMarginFraction(null))
      .mul(this.totalOpenPositionNotional)
      .div(marketInfo.baseImf)
      .div(markPrice.decimal);
    const maxOpenSize = Decimal.max(
      this.positionInfos[marketInfo.symbol].long,
      this.positionInfos[marketInfo.symbol].short,
    ).add(changeInOpenSizeAllowed);

    if (trade.long) {
      return (
        feeMultiplier *
        Decimal.max(
          new Decimal(0),
          maxOpenSize.minus(this.positionInfos[marketInfo.symbol].long),
        ).toNumber()
      );
    }
    return (
      feeMultiplier *
      Decimal.max(
        new Decimal(0),
        maxOpenSize.minus(this.positionInfos[marketInfo.symbol].short),
      ).toNumber()
    );
  }

  maxCollateralSpendable(trade: TradeInfo) {
    return trade.price * this.maxContractsPurchaseable(trade);
  }

  get largestWeightedPosition() {
    let symbol = "";
    let maxWeightedPosition = new Decimal(0);
    for (const marketKey of Object.keys(this.state.markets)) {
      const { positionWeighted } = this.positionWeighted(marketKey);
      if (positionWeighted.gt(maxWeightedPosition)) {
        symbol = marketKey;
        maxWeightedPosition = positionWeighted;
      }
    }
    return { symbol, weightedPosition: maxWeightedPosition };
  }

  get largestWeightedBorrow() {
    let symbol = "";
    let maxWeightedBorrow = new Decimal(0);
    for (const assetKey of Object.keys(this.balances)) {
      if (this.balances[assetKey].number < 0) {
        const { weightedBorrow } = this.getWeightedBorrow(assetKey);
        if (weightedBorrow.gt(maxWeightedBorrow)) {
          symbol = assetKey;
          maxWeightedBorrow = weightedBorrow;
        }
      }
    }
    return { symbol, weightedBorrow: maxWeightedBorrow };
  }

  get largestBalanceSymbol() {
    let symbol = "USDC";
    let maxBalance = new Decimal(0);
    for (const assetKey of Object.keys(this.balances)) {
      if (this.balances[assetKey].number > 0) {
        if (this.balances[assetKey].decimal.gt(maxBalance)) {
          symbol = assetKey;
          maxBalance = this.balances[assetKey].decimal;
        }
      }
    }
    return symbol;
  }

  get isLiquidatable() {
    return this.maintenanceMarginFraction.gt(this.marginFraction);
  }

  get isBankrupt() {
    if (this.isLiquidatable) {
      for (const position of this.positions) {
        if (position.coins.number != 0) {
          return false;
        }
      }
      for (const assetKey of Object.keys(this.state.assets)) {
        const price = this.state.assets[assetKey]!.indexPrice.number;
        const value = this.balances[assetKey].decimal.mul(price).toNumber();
        if (value > 1) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  get isPerpLiq() {
    const largestPosition = this.largestWeightedPosition;
    const largestBorrow = this.largestWeightedBorrow;
    if (largestPosition.weightedPosition.gt(largestBorrow.weightedBorrow)) {
      return true;
    }
    return false;
  }
}
