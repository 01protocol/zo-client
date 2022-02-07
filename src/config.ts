import { PublicKey } from "@solana/web3.js";

export { IDL } from "./types/zo";

export { DEX_IDL } from "./types/dex";

// == PARAMS ==
export const ZO_FUTURE_TAKER_FEE = 0.001; // 10bps
export const ZO_OPTION_TAKER_FEE = 0.001; // temporary value, not actual
export const ZO_SQUARE_TAKER_FEE = 0.0015; // 15bps, not actual
export const USDC_DECIMALS = 6;

export const BASE_IMF_DIVIDER = 1000;
export const MMF_MULTIPLIER = 2;
export const USD_DECIMALS = 6;

export const CACHE_REFRESH_INTERVAL = 10000;
export const HARD_REFRESH_INTERVAL = 700000;

export interface MarginsClusterConfig {
  cacheRefreshInterval: number;
  verbose: boolean;
  loadWithOrders: boolean;
  hardRefreshInterval: number;
}

export const DEFAULT_MARGINS_CLUSTER_CONFIG: MarginsClusterConfig = {
  cacheRefreshInterval: CACHE_REFRESH_INTERVAL,
  verbose: true,
  loadWithOrders: true,
  hardRefreshInterval: HARD_REFRESH_INTERVAL,
};
// == 01 CONSTANTS ==

// deprecated; here for backwards compatibility
export const ZO_STATE_KEY = new PublicKey(
  "KwcWW7WvgSXLJcyjKZJBHLbfriErggzYHpjS9qjVD5F",
);
export const ZO_DEVNET_STATE_KEY = new PublicKey(
  "KwcWW7WvgSXLJcyjKZJBHLbfriErggzYHpjS9qjVD5F",
);
export const ZO_MAINNET_STATE_KEY = new PublicKey(
  "71yykwxq1zQqy99PgRsgZJXi2HHK2UDx9G4va7pH6qRv",
);

// == 01 PROGRAM IDS ==
export const ZERO_ONE_DEVNET_PROGRAM_ID = new PublicKey(
  "Zo1ThtSHMh9tZGECwBDL81WJRL6s3QTHf733Tyko7KQ",
);
export const ZERO_ONE_MAINNET_PROGRAM_ID = new PublicKey(
  "Zo1ggzTUKMY5bYnDvT5mtVeZxzf2FaLTbKkmvGUhUQk",
);
export const ZO_DEX_DEVNET_PROGRAM_ID = new PublicKey(
  "ZDxUi178LkcuwdxcEqsSo2E7KATH99LAAXN5LcSVMBC",
);
export const ZO_DEX_MAINNET_PROGRAM_ID = new PublicKey(
  "ZDx8a8jBqGmJyxi1whFxxCo5vG6Q9t4hTzW2GSixMKK",
);
export const SERUM_DEVNET_SPOT_PROGRAM_ID = new PublicKey(
  "DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY",
);
export const SERUM_MAINNET_SPOT_PROGRAM_ID = new PublicKey(
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
);

// == ACCOUNT SIZES ==
export const CONTROL_ACCOUNT_SIZE = 8 + 4482;

// == PARAMS ==
export const ZO_TAKER_FEE = 0.001; // 10bps

// == 01 PROGRAM IDS ==
export const ZERO_ONE_PROGRAM_ID = new PublicKey(
  "DuSPvazsfthvWRuJ8TUs984VXCeUfJ1qbzd8NwkRLEpd",
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
export const MAINNET_ENDPOINT = "https://ssc-dao.genesysgo.net/";

// == USDC ==

export const USDC_MAINNET_MINT_ADDRESS = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
);

export const USDC_DEVNET_MINT_ADDRESS = new PublicKey(
  "7UT1javY6X1M9R2UrPGrwcZ78SX3huaXyETff5hm5YdX",
);
