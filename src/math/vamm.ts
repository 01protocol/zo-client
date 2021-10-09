import { BN } from "@project-serum/anchor";

export namespace Vamm {
  export function tradeOutputsFromCollateral({
    long,
    collateralAmount,
    prevCollateral,
    prevContract,
    k,
  }: Readonly<{
    long: boolean;
    collateralAmount: BN;
    prevCollateral: BN;
    prevContract: BN;
    k: BN;
  }>) {
    const { ind, dep, delta } = calcTrade(
      long,
      collateralAmount,
      prevCollateral,
      prevContract,
      k,
    );
    return {
      collateral: ind,
      contract: dep,
      contractDelta: delta,
    };
  }

  export function tradeOutputsFromContract({
    long,
    contractAmount,
    prevCollateral,
    prevContract,
    k,
  }: Readonly<{
    long: boolean;
    contractAmount: BN;
    prevCollateral: BN;
    prevContract: BN;
    k: BN;
  }>) {
    const { ind, dep, delta } = calcTrade(
      !long,
      contractAmount,
      prevContract,
      prevCollateral,
      k,
    );
    return {
      contract: ind,
      collateral: dep,
      collateralDelta: delta,
    };
  }

  function calcTrade(long: boolean, ind: BN, prevInd: BN, prevDep: BN, k: BN) {
    const newInd = long ? prevInd.add(ind) : prevInd.sub(ind);
    const newDep = k.div(newInd);
    const depDelta = long ? prevDep.sub(newDep) : newDep.sub(prevDep);
    return {
      ind: newInd,
      dep: newDep,
      delta: depDelta,
    };
  }
}
