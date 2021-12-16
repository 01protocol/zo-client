import { PublicKey } from "@solana/web3.js";

export { IDL } from "./types/zo";

// == ACCOUNT SIZES ==
export const STATE_ACCOUNT_SIZE = 8 + 16085;
export const CACHE_ACCOUNT_SIZE = 8 + 107200;
export const CONTROL_ACCOUNT_SIZE = 8 + 8932;

export const DEX_MARKET_ACCOUNT_SIZE = 12 + 1360;
export const REQ_Q_ACCOUNT_SIZE = 12 + 5120;
export const EVENT_Q_ACCOUNT_SIZE = 12 + 262144;
export const BIDS_ACCOUNT_SIZE = 12 + 65536;
export const ASKS_ACCOUNT_SIZE = 12 + 65536;

// == 01 PROGRAM IDS ==
export const ZERO_ONE_PROGRAM_ID = new PublicKey(
  "AjGXinumkbrDGkAPmSEPGEQ8jC89ExXArbF6uEioEZS5",
);
export const ZO_DEX_PROGRAM_ID = new PublicKey(
  "249z8gAKdX41bjfz7SFUxGmbAqDtSLU2tsSYzb7MkUCN",
);
export const SERUM_SPOT_PROGRAM_ID = new PublicKey(
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
);
export const SERUM_SWAP_PROGRAM_ID = new PublicKey(
  "22Y43yTVxuUkoRKdm9thyRhQ3SdgQS7c7kB6UNCiaczD",
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

// == CLUSTERS ==
export const DEV_ENDPOINT = "https://api.devnet.solana.com";
