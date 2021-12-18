import { PublicKey } from "@solana/web3.js";

export { IDL } from "./types/zo";

// == ACCOUNT SIZES ==
export const CONTROL_ACCOUNT_SIZE = 8 + 4482;

// == PARAMS ==
export const ZO_TAKER_FEE = 0.001; // 10bps

// == 01 PROGRAM IDS ==
export const ZERO_ONE_PROGRAM_ID = new PublicKey(
  "97w3k9mPvtGtU9BYjhbHRrwJr3U4Zk8mF9gNraJJ85vH",
);
export const ZO_DEX_PROGRAM_ID = new PublicKey(
  "HFhHrACeKGYdfsDaCNUryRJvPqWzi3PPNXxXCdofZ2L6",
);
export const SERUM_SPOT_PROGRAM_ID = new PublicKey(
  "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY",
);
export const SERUM_SWAP_PROGRAM_ID = new PublicKey(
  "BiUikS42eRsdmkGBu3qXDy8Tu4cuWYYnuFVZzKzjVEET",
);

// == SOLANA PROGRAM IDS ==
export const SYSTEM_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111",
);
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);
export const RENT_PROGRAM_ID = new PublicKey(
  "SysvarRent111111111111111111111111111111111",
);
export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112",
);

// == CLUSTERS ==
export const DEV_ENDPOINT = "https://api.devnet.solana.com";
