import { PublicKey } from "@solana/web3.js";

export { IDL } from "./types/zo";
export { DEX_IDL } from "./types/dex";

// == ACCOUNT SIZES ==
export const CONTROL_ACCOUNT_SIZE = 8 + 4482;

// == PARAMS ==
export const ZO_FUTURE_TAKER_FEE = 0.001; // 10bps
export const ZO_OPTION_TAKER_FEE = 0.001; // temporary value, not actual
export const USDC_DECIMALS = 6;

// == 01 CONSTANTS ==
export const ZO_STATE_KEY = new PublicKey(
  "HAdeMzG1ZuzhWnt26iyggLhYUen3YosXiD5sgDXJoNDY",
);

// == 01 PROGRAM IDS ==
export const ZERO_ONE_PROGRAM_ID = new PublicKey(
  "DuSPvazsfthvWRuJ8TUs984VXCeUfJ1qbzd8NwkRLEpd",
);
export const ZO_DEX_PROGRAM_ID = new PublicKey(
  "CX8xiCu9uBrLX5v3DSeHX5SEvGT36PSExES2LmzVcyJd",
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
