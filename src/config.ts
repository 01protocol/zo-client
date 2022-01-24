import { PublicKey } from "@solana/web3.js";

export { IDL } from "./types/zo";
export { DEX_IDL } from "./types/dex";

// == ACCOUNT SIZES ==
export const CONTROL_ACCOUNT_SIZE = 8 + 4482;

// == PARAMS ==
export const ZO_FUTURE_TAKER_FEE = 0.001; // 10bps
export const ZO_OPTION_TAKER_FEE = 0.001; // temporary value, not actual
export const ZO_SQUARE_TAKER_FEE = 0.0015; // 15bps
export const USDC_DECIMALS = 6;

// == 01 CONSTANTS ==
export const ZO_STATE_KEY = new PublicKey(
  "KwcWW7WvgSXLJcyjKZJBHLbfriErggzYHpjS9qjVD5F",
);

// == 01 PROGRAM IDS ==
export const ZERO_ONE_PROGRAM_ID = new PublicKey(
  "Zo1ThtSHMh9tZGECwBDL81WJRL6s3QTHf733Tyko7KQ",
);
export const ZO_DEX_PROGRAM_ID = new PublicKey(
  "ZDxUi178LkcuwdxcEqsSo2E7KATH99LAAXN5LcSVMBC",
);
export const SERUM_SPOT_PROGRAM_ID = new PublicKey(
  "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY",
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
