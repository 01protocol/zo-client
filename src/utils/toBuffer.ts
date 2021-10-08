import * as BN from "bn.js";
import { Buffer } from "buffer";

export default function toBuffer(num: BN): Buffer {
  const a = num.toArray().reverse();
  const b = Buffer.from(a);
  if (b.length === 8) {
    return b;
  }

  const zeroPad = Buffer.alloc(8);
  b.copy(zeroPad);
  return zeroPad;
}
