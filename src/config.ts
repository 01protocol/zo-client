import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { Idl } from "@project-serum/anchor";

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
export const DEX_PROGRAM_ID = new PublicKey(
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

export const ENDPOINT = "https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/";

export const SKIP_PREFLIGHT = true;

export const USDC_MINT_ADDRESS = new PublicKey(
  "ANPW6n3x5YEbqsAM9tGteXRuQAhFcG1XQq75gbQFajP8",
);

export const USDC_MINT_AUTH_ADDRESS = new PublicKey(
  "5t1Goi4tfDueXRuDqNVx6Kw5BE3fEKBFNEvHTTP1YYPc",
);

export const LOT_SIZE = 1000;

export const FEE = 0.2;

export const PC_STARTING_BUFFER = 100_000_000;

export const USDC_PRIVATE_KEY_ADDRESS = [
  103, 128, 86, 103, 226, 250, 41, 119, 109, 55, 1, 204, 42, 182, 8, 253, 152,
  47, 133, 62, 240, 19, 203, 149, 90, 22, 193, 88, 115, 169, 254, 207, 72, 127,
  173, 85, 214, 147, 203, 179, 171, 26, 220, 48, 115, 8, 61, 71, 179, 142, 75,
  221, 231, 10, 195, 130, 150, 145, 18, 58, 223, 132, 196, 147,
];

export const BOP_DURATION = 60 * 30;

export const DUMMY_WALLET: any = {
  // @ts-ignore
  payer: new Keypair(),
  signTransaction: async (tx: Transaction) => tx,
  signAllTransactions: async (txs: Transaction[]) => txs,
  publicKey: new PublicKey("11111111111111111111111111111111"),
};
