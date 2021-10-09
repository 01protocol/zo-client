// TODO move fe/src/math/math.ts here
import Decimal from "decimal.js";

export namespace Lmsr {
  export function maxCostWithSlippage({
    slippage,
    calculatedFinalCost,
  }: Readonly<{
    slippage: Decimal;
    calculatedFinalCost: Decimal;
  }>): Decimal {
    return calculatedFinalCost.times(slippage.times(new Decimal(100)));
  }
}
