import { AccountInfo, Commitment, PublicKey } from "@solana/web3.js";
import { Program, ProgramAccount } from "@project-serum/anchor";
import State from "../State";
import Num from "../../Num";
import Decimal from "decimal.js";
import { OOInfo, PositionInfo, TradeInfo } from "../../types/dataTypes";
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
  /**
   * Creates a margin account.
   * @param program The Zo Program
   * @param st The Zo State object, overrides the default config.
   * @param commitment commitment of the transaction, finalized is used as default
   */
  static async create(
    program: Program<Zo>,
    st: State,
    commitment: Commitment = "finalized",
  ): Promise<Margin> {
    return (await MarginWeb3.create(program, st, commitment)) as Margin;
  }

  /**
   * Loads a new Margin object.
   */
  static async exists(
    program: Program<Zo>,
    st: State,
    owner?: PublicKey,
  ): Promise<boolean> {
    const marginOwner = owner || program.provider.wallet.publicKey;
    const [key] = await this.getMarginKey(st, marginOwner, program);
    return null != (await program.provider.connection.getAccountInfo(key));
  }

  static async getMarginKey(
    st: State,
    marginOwner: PublicKey,
    program: Program<Zo>,
  ) {
    return await this.getPda(st, marginOwner, program.programId);
  }

  /**
   * get total funding amount from all the markets
   */
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

  /**
   * get all balances for the account (adjusts usdc balance for realized pnl and funding)
   */
  get balances(): { [key: string]: Num } {
    const balances: { [key: string]: Num } = { ...this._balances };
    balances["USDC"] = new Num(
      this._balances["USDC"]!.decimal.add(this.realizedPnL).add(this.funding),
      this._balances["USDC"]!.decimals,
    );
    return balances;
  }

  /**
   * get deposited collateral value in USD terms
   */
  get unweightedCollateralValue() {
    let depositedCollateral = new Decimal(0);
    for (const marketKey of Object.keys(this.balances)) {
      depositedCollateral = depositedCollateral.add(
        this.balances[marketKey]!.decimal.mul(
          this.state.assets[marketKey]!.indexPrice.decimal,
        ),
      );
    }

    return depositedCollateral;
  }

  /**
   * Account value(with unweighted collateral)
   */
  get unweightedAccountValue() {
    return this.unweightedCollateralValue.add(this.cumulativeUnrealizedPnL);
  }

  /* -------------------------------------------------------------------------- */
  /*                                                                            */
  /*                                Math&Data stuff below                       */
  /*                                                                            */
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  /*                                Market Position Infos                       */

  /* -------------------------------------------------------------------------- */

  /**
   * Maintenance Margin Fraction
   */
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

  /**
   * Open Margin Fraction
   */
  get openMarginFraction() {
    if (this.totalOpenPositionNotional.toNumber() == 0) {
      return new Decimal(1);
    }
    return Decimal.min(
      this.weightedAccountValue,
      this.weightedCollateralValue,
    ).div(this.totalOpenPositionNotional);
  }

  /**
   * Margin Fraction
   */
  get marginFraction() {
    if (this.totalPositionNotional.toNumber() === 0) {
      return new Decimal(1);
    }
    return this.weightedAccountValue.div(this.totalPositionNotional);
  }

  /**
   * Largest position by weight
   */
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

  /**
   * Largest borrow by weight
   */
  get largestWeightedBorrow() {
    let symbol = "";
    let maxWeightedBorrow = new Decimal(0);
    for (const assetKey of Object.keys(this.balances)) {
      if (this._balances[assetKey]!.number < 0) {
        const { weightedBorrow } = this.getWeightedBorrow(assetKey);
        if (weightedBorrow.gt(maxWeightedBorrow)) {
          symbol = assetKey;
          maxWeightedBorrow = weightedBorrow;
        }
      }
    }
    return { symbol, weightedBorrow: maxWeightedBorrow };
  }

  /* -------------------------------------------------------------------------- */
  /*                 Collateral & Account Value information                     */

  /* -------------------------------------------------------------------------- */

  /**
   * Largest balance
   */
  get largestBalanceSymbol() {
    let symbol = "USDC";
    let maxBalance = new Decimal(0);
    for (const assetKey of Object.keys(this._balances)) {
      if (this._balances[assetKey]!.number > 0) {
        if (this._balances[assetKey]!.decimal.gt(maxBalance)) {
          symbol = assetKey;
          maxBalance = this._balances[assetKey]!.decimal;
        }
      }
    }
    return symbol;
  }

  /**
   * Is Liquidatable
   */
  get isLiquidatable() {
    return this.maintenanceMarginFraction.gt(this.marginFraction);
  }

  /**
   * Is Liquidatable with tolerance(mmf*tolerance>mf)
   */
  isLiquidatableWithTolerance(tolerance: number) {
    return this.maintenanceMarginFraction
      .mul(tolerance)
      .gt(this.marginFraction);
  }

  /**
   * Is Bankrupt
   */
  get isBankrupt() {
    if (this.isLiquidatable) {
      for (const position of this.positions) {
        if (position.coins.number != 0) {
          return false;
        }
      }
      for (const assetKey of Object.keys(this.state.assets)) {
        const price = this.state.assets[assetKey]!.indexPrice.number;
        const value = this.balances[assetKey]!.decimal.mul(price).toNumber();
        if (value > 1) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Should account liquidate perp or spot(based on the weight of the position)
   */
  get isPerpLiquidation() {
    const largestPosition = this.largestWeightedPosition;
    const largestBorrow = this.largestWeightedBorrow;
    if (
      largestPosition.weightedPosition.gt(largestBorrow.weightedBorrow) ||
      this.largestWeightedBorrow.symbol == this.largestBalanceSymbol ||
      this._balances[this.largestBalanceSymbol]!.number <= 0
    ) {
      return true;
    }
    return false;
  }

  /* -------------------------------------------------------------------------- */
  /*                               account fractions                       */

  /* -------------------------------------------------------------------------- */

  /**
   * Total position Notional
   */
  get totalPositionNotional() {
    let res = new Decimal(0);
    for (const position of this.positions) {
      const market = this.state.markets[position.marketKey]!;
      const size = position.coins.decimal.mul(market.indexPrice.decimal);
      res = res.add(size);
    }
    return res.add(this.borrowPositionNotionalValue);
  }

  /**
   * Total open position notional
   */
  get totalOpenPositionNotional() {
    let res = new Decimal(0);
    for (const order of this.orders) {
      const market = this.state.markets[order.marketKey]!;

      const size = order.coins.decimal.mul(market.indexPrice.decimal);
      res = res.add(size);
    }
    return res.add(this.totalPositionNotional);
  }

  /**
   * Tied collateral value
   */
  get tiedCollateral() {
    return this.borrowLendingTiedCollateralValue.add(
      this.positionsTiedCollateral,
    );
  }

  /**
   * Collateral of the free value
   */
  get freeCollateralValue() {
    const freeCollateral = Decimal.min(
      this.weightedAccountValue,
      this.weightedCollateralValue,
    ).minus(this.tiedCollateral);
    return Decimal.max(new Decimal(0), freeCollateral);
  }

  /* -------------------------------------------------------------------------- */
  /*                               Borrow & Withdrawal Infos                       */

  /* -------------------------------------------------------------------------- */

  /**
   * returns the total unrealized pnl for all positions
   */
  get cumulativeUnrealizedPnL() {
    let totalPnL = new Decimal(0);
    for (const position of this.positions) {
      totalPnL = totalPnL.add(this.positionPnL(position));
    }

    return totalPnL;
  }

  /**
   * get WEIGHTED collateral value in USD terms
   */
  get weightedCollateralValue() {
    let depositedCollateral = new Decimal(0);
    for (const assetKey of Object.keys(this.balances)) {
      if (this.balances[assetKey]!.number >= 0) {
        depositedCollateral = depositedCollateral.add(
          this.balances[assetKey]!.decimal.mul(
            this.state.assets[assetKey]!.indexPrice.decimal,
          ).mul(this.state.assets[assetKey]!.weight / 1000),
        );
      } else {
        depositedCollateral = depositedCollateral.add(
          this.balances[assetKey]!.decimal.mul(
            this.state.assets[assetKey]!.indexPrice.decimal,
          ),
        );
      }
    }

    return depositedCollateral;
  }

  /* -------------------------------------------------------------------------- */
  /*                               Trade Information                      */

  /* -------------------------------------------------------------------------- */

  /**
   * Account value(with weighted collateral, lower than the actual account value)
   */
  get weightedAccountValue() {
    return this.weightedCollateralValue.add(this.cumulativeUnrealizedPnL);
  }

  /**
   * returns total realized pnl in case it hasn't been cranked
   */
  private get realizedPnL() {
    let realizedPnL = new Decimal(0);
    for (const position of this.positions) {
      realizedPnL = realizedPnL.add(position.realizedPnL.number);
    }
    return realizedPnL;
  }

  /* -------------------------------------------------------------------------- */
  /*                               Liquidation Helpers                      */

  /* -------------------------------------------------------------------------- */

  /**
   * get the USD value of the collateral tied in Borrows & Lending
   */
  private get borrowLendingTiedCollateralValue() {
    let tiedCollateral = new Decimal(0);
    for (const marketKey of Object.keys(this.balances)) {
      if (this.balances[marketKey]!.number < 0) {
        const borrowNotional = this.balances[marketKey]!.decimal.mul(
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

  /**
   * Get Borrow Position Notional Value
   */
  private get borrowPositionNotionalValue() {
    let bnlPositionNotional = new Decimal(0);
    for (const marketKey of Object.keys(this.balances)) {
      if (this.balances[marketKey]!.number < 0) {
        bnlPositionNotional = bnlPositionNotional.add(
          this.balances[marketKey]!.decimal.mul(
            this.state.assets[marketKey]!.indexPrice.decimal,
          ),
        );
      }
    }
    return bnlPositionNotional.abs();
  }

  /**
   * Get collateral Initial Margin Fraction Information
   */
  private get collateralInitialMarginInfo(): [Decimal, Decimal] {
    let [imfWeightedTotal, imfWeight] = [new Decimal(0), new Decimal(0)];

    for (const marketKey of Object.keys(this.balances)) {
      if (this.balances[marketKey]!.number < 0) {
        const factor = new Decimal(1.1)
          .div(this.state.assets[marketKey]!.weight / 1000)
          .minus(new Decimal(1));
        const weight = this.balances[marketKey]!.decimal.mul(
          this.state.assets[marketKey]!.indexPrice.decimal,
        );
        imfWeightedTotal = imfWeightedTotal.add(weight.mul(factor));
        imfWeight = imfWeight.add(weight);
      }
    }
    return [imfWeightedTotal.abs(), imfWeight.abs()];
  }

  /**
   * Get Collateral MMF info
   * @private
   */
  private get collateralMaintenanceMarginInfo(): [Decimal, Decimal] {
    let [mmfWeightedTotal, mmfWeight] = [new Decimal(0), new Decimal(0)];
    for (const marketKey of Object.keys(this.balances)) {
      if (this.balances[marketKey]!.number < 0) {
        const { weight, weightedBorrow } = this.getWeightedBorrow(marketKey);
        mmfWeightedTotal = mmfWeightedTotal.add(weightedBorrow);
        mmfWeight = mmfWeight.add(weight);
      }
    }

    return [mmfWeightedTotal.abs(), mmfWeight.abs()];
  }

  /**
   * Value of the collateral tied in positions
   */
  private get positionsTiedCollateral() {
    const posInfos = this._ooInfos;

    let tiedCollateral = new Decimal(0);
    for (const marketKey of Object.keys(this.state.markets)) {
      const posNotional = posInfos[marketKey]!.posSize.mul(
        this.state.markets[marketKey]!.indexPrice.decimal,
      );
      const openSize = Decimal.max(
        posInfos[marketKey]!.long,
        posInfos[marketKey]!.short,
      );
      tiedCollateral = tiedCollateral.add(
        this.state.markets[marketKey]!.baseImf.mul(openSize.add(posNotional)),
      );
    }
    return tiedCollateral;
  }

  /**
   * Value of the collateral tied in positions
   *
   */
  getMaxSpotReducibleAsset(symbolBorrowed: string, symbolSupplied: string) {
    const assetBorrowed = this.state.assets[symbolBorrowed]!;
    const assetSupplied = this.state.assets[symbolSupplied]!;
    const liquidationFee =
      (1000 + assetBorrowed.liqFee) / (1000 - assetSupplied.liqFee) - 1;
    const imfBase = (1.1 * 1000) / assetBorrowed.weight - 1;
    const [initialMarginTotalWeighted, _] = this.initialMarginInfo(null);
    const numerator = initialMarginTotalWeighted.minus(
      Decimal.min(this.weightedAccountValue, this.weightedCollateralValue),
    );

    const denominator = assetBorrowed.indexPrice.decimal.mul(imfBase).mul(
      new Decimal(1).minus(
        new Decimal(assetBorrowed.weight / 1000)
          .mul(1 + liquidationFee)
          .minus(1)
          .div(imfBase),
      ),
    );
    return numerator.div(denominator);
  }

  /**
   * returns infos about open orders accounts(position size + asks&bids on the book)
   */
  private get _ooInfos() {
    const posInfos: { [key: string]: OOInfo } = {};
    for (const marketKey of Object.keys(this.state.markets)) {
      posInfos[marketKey] = {
        long: new Decimal(0),
        short: new Decimal(0),
        posSize: new Decimal(0),
        isLong: false,
      };
    }
    for (const position of this.positions) {
      posInfos[position.marketKey]!.posSize = position.coins.decimal;
      posInfos[position.marketKey]!.isLong = position.isLong;
      if (position.isLong) {
        posInfos[position.marketKey]!.long = position.coins.decimal;
      } else {
        posInfos[position.marketKey]!.short = position.coins.decimal;
      }
    }

    for (const order of this.orders) {
      if (order.long) {
        posInfos[order.marketKey]!.long = posInfos[order.marketKey]!.long.add(
          order.coins.decimal,
        );
      } else {
        posInfos[order.marketKey]!.short = posInfos[order.marketKey]!.short.add(
          order.coins.decimal,
        );
      }
    }

    return posInfos;
  }

  /* -------------------------------------------------------------------------- */
  /*                                General Margin Info                       */

  /* -------------------------------------------------------------------------- */

  static async load(
    program: Program<Zo>,
    st: State,
    ch?: Cache,
    owner?: PublicKey,
  ): Promise<Margin> {
    if (ch)
      console.warn(
        "[DEPRECATED SOON: Cache param will soon be removed from here; cache is taken from state directly.]",
      );
    return (await super.loadWeb3(program, st, owner)) as Margin;
  }

  static async loadPrefetched(
    program: Program<Zo>,
    st: State,
    ch: Cache | null,
    prefetchedMarginData: ProgramAccount<MarginSchema>,
    prefetchedControlData: ProgramAccount<ControlSchema>,
    withOrders: boolean,
  ): Promise<Margin> {
    if (ch)
      console.warn(
        "[DEPRECATED SOON: Cache param will soon be removed from here; cache is taken from state directly.]",
      );
    return (await super.loadPrefetchedWeb3(
      program,
      st,
      prefetchedMarginData,
      prefetchedControlData,
      withOrders,
    )) as Margin;
  }

  static async loadFromAccountInfo(
    program: Program<Zo>,
    st: State,
    accountInfo: AccountInfo<Buffer>,
    withOrders: boolean,
  ): Promise<Margin> {
    return (await super.loadFromAccountInfo(
      program,
      st,
      accountInfo,
      withOrders,
    )) as Margin;
  }

  /**
   * loads all margin accounts
   * @param program
   * @param st state
   * @param ch cache
   * @param verbose
   * @param withOrders - load orders for each margin account
   */
  static async loadAllMargins(
    program: Program<Zo>,
    st: State,
    ch: Cache | null = null,
    verbose = false,
    withOrders = true,
  ) {
    if (ch) {
      console.warn(
        "[DEPRECATED SOON: Cache param will soon be removed from here, and will be fetched from state directly.]",
      );
    }
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
          null,
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

  /* -------------------------------------------------------------------------- */
  /*                              Other  Helper Functions                    */

  /* -------------------------------------------------------------------------- */

  liqPrice(position: PositionInfo) {
    const marketKey = position.marketKey;
    const pmmf = this.state.markets[marketKey]!.pmmf;
    const indexPrice = this.state.markets[marketKey]!.indexPrice.decimal;

    const priceChange = this.marginFraction
      .sub(this.maintenanceMarginFraction)
      .mul(this.totalOpenPositionNotional)
      .div(position.coins.decimal.mul(new Decimal(1).sub(pmmf)));
    if (position.isLong) {
      const price = indexPrice.sub(priceChange).toNumber();
      return price > 0 ? price : Infinity;
    }
    const price = indexPrice.add(priceChange).toNumber();
    return price > 0 ? price : Infinity;
  }

  /**
   * returns the position info for the specific market key
   * @marketKey  market key
   */
  position(marketKey: string) {
    return this.positions.find((el) => el.marketKey === marketKey)!;
  }

  /**
   * returns unrealized pnl for the position
   * @param position
   */
  positionPnL(position: PositionInfo): Decimal {
    const market = this.state.markets[position.marketKey]!;
    const diff = position.coins.decimal
      .mul(market.indexPrice.decimal)
      .sub(position.pCoins.decimal);

    if (position.isLong) return diff;
    return diff.mul(-1);
  }

  /**
   * returns unrealized pnl for the position
   * @param position
   */
  positionPnLBasedOnMarkPrice(position: PositionInfo): Decimal {
    const market = this.state.markets[position.marketKey]!;
    const diff = position.coins.decimal
      .mul(market.markPrice.decimal)
      .sub(position.pCoins.decimal);

    if (position.isLong) return diff;
    return diff.mul(-1);
  }

  /**
   * get funding for the position
   * @param position
   */
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

  /**
   * Initial Margin Fraction
   */
  initialMarginInfo(trade?): [Decimal, Decimal] {
    let [imfWeightedTotal, imfWeight] = this.collateralInitialMarginInfo;

    for (const marketKey of Object.keys(this.state.markets)) {
      let addOn = this._ooInfos[marketKey]!.posSize;
      if (trade && marketKey == trade.marketKey) {
        addOn = this._ooInfos[marketKey]!.posSize.mul(
          this._ooInfos[marketKey]!.isLong ? 1 : -1,
        )
          .add(trade.coins * (trade.long ? 1 : -1))
          .abs();
      }
      const posNotional = addOn.mul(
        this.state.markets[marketKey]!.indexPrice.decimal,
      );
      imfWeight = imfWeight.add(posNotional);
      const pimf = this.state.markets[marketKey]!.pmmf.mul(2);
      imfWeightedTotal = imfWeightedTotal.add(pimf.mul(posNotional));
    }
    return [imfWeightedTotal, imfWeight];
  }

  /**
   * Initial Margin Fraction
   */
  initialMarginFraction(trade?) {
    const [imfWeightedTotal, imfWeight] = this.initialMarginInfo(trade);

    if (imfWeight.toNumber() === 0) {
      return new Decimal(0);
    }
    return imfWeightedTotal.div(imfWeight);
  }

  /**

   /**
   * Withdrawable collateral without borrow
   * @param assetKey
   */
  collateralWithdrawable(assetKey: string) {
    const balance = this.balances[assetKey]!.decimal;
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

      if (res.toNumber() != balance.toNumber()) {
        const VALUE_NERF = 0.02;
        res = res.mul(1 - VALUE_NERF);
      }
      return res;
    }
    return new Decimal(0);
  }

  /**
   * Withdrawable collateral with borrow
   * @param assetKey
   */
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

  /**
   * Max Contracts Purchaseable for the trade
   * @param trade
   * @param marketKey
   * @marketKey marketKey
   */
  maxContractsPurchaseable(trade: TradeInfo, marketKey: string) {
    const marketInfo = this.state.markets[marketKey]!;
    const markPrice = marketInfo.markPrice;
    const TAKER_TRADE_FEE = 0.1;
    const MAKER_TRADE_FEE = 0.0;
    //decrease max amounts to account for price fluctuations and on-chain approximations
    const VALUE_NERF = 0.02;
    const feeMultiplier = trade.postOrder
      ? 1 - MAKER_TRADE_FEE - VALUE_NERF
      : 1 - TAKER_TRADE_FEE - VALUE_NERF;

    if (this.totalOpenPositionNotional.toNumber() === 0) {
      return Decimal.min(
        this.weightedAccountValue,
        this.weightedCollateralValue,
      )
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
      this._ooInfos[marketInfo.symbol]!.long,
      this._ooInfos[marketInfo.symbol]!.short,
    ).add(changeInOpenSizeAllowed);

    if (trade.long) {
      return (
        feeMultiplier *
        Decimal.max(
          new Decimal(0),
          maxOpenSize.minus(this._ooInfos[marketInfo.symbol]!.long),
        ).toNumber()
      );
    }
    return (
      feeMultiplier *
      Decimal.max(
        new Decimal(0),
        maxOpenSize.minus(this._ooInfos[marketInfo.symbol]!.short),
      ).toNumber()
    );
  }

  /**
   * Max Collateral Purchaseable for the trade
   * @param trade
   * @param marketKey
   * @marketKey marketKey
   */
  maxCollateralSpendable(trade: TradeInfo, marketKey: string) {
    return trade.price * this.maxContractsPurchaseable(trade, marketKey);
  }

  /**
   * Position weighted
   */
  private positionWeighted(marketKey: string) {
    const posNotional = this._ooInfos[marketKey]!.posSize.mul(
      this.state.markets[marketKey]!.indexPrice.decimal,
    );
    const pmmf = this.state.markets[marketKey]!.pmmf;
    const positionWeighted = pmmf.mul(posNotional);
    return { posNotional, positionWeighted };
  }

  /**
   * Get the value of the weighted borrow
   * @param marketKey
   * @private
   */
  private getWeightedBorrow(marketKey: string) {
    const factor = new Decimal(1.03)
      .div(this.state.assets[marketKey]!.weight / 1000)
      .minus(new Decimal(1));
    const weight = this.balances[marketKey]!.decimal.mul(
      this.state.assets[marketKey]!.indexPrice.decimal,
    ).abs();
    const weightedBorrow = weight.mul(factor);
    return { weight, weightedBorrow };
  }
}
