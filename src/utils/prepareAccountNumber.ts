import { BN } from "@project-serum/anchor";
import Decimal from "decimal.js";

export function prepareAccountNumber(numSharesToClose: BN | Decimal): BN {
  if (numSharesToClose instanceof Decimal) {
    numSharesToClose = new BN(numSharesToClose.toNumber());
  }
  return numSharesToClose.muln(100);
}
