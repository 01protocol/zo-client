import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { Idl } from "@project-serum/anchor";

// == IDLs ==
import IDL_MARGIN_ from "./idl/margin.json";

export const IDL_MARGIN = IDL_MARGIN_ as Idl;

// == 01 PROGRAM IDS ==
export const ZERO_ONE_MARGIN_PROGRAM_ID = new PublicKey(
  "EhYhuJ1r778o5WdCYiKtedBap9FFVdmdAbzrsuCKtwqB",
);
export const DEX_PROGRAM_ID = new PublicKey(
  "249z8gAKdX41bjfz7SFUxGmbAqDtSLU2tsSYzb7MkUCN",
);

// == MARGIN IDS ==
export const MARGIN_STATE_ID = new PublicKey(
  "AJaVtZzQ7eL4jxSfE4vGAQHjBsYz1tqrmMewWGsMXmRy",
);

// == EVERLASTING ==
export const EVER_MARKET_ID = new PublicKey(
  "7htE41GPCgnom2Q1ChT4qh7wcpFWq94RfeUexBmsHjXw",
);
export const DEX_MARKET_ID = new PublicKey(
  "CiakMn8A53zQQPCauHUH2bGiWnTSNymGBiwzTqGwfAQt",
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
export const CLOCK_PROGRAM_ID = new PublicKey(
  "SysvarC1ock11111111111111111111111111111111",
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

// == PYTH PROGRAM IDS ==
// sol
export const PYTH_PRICE_INFO = new PublicKey(
  "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix",
);
export const PYTH_PRODUCT_INFO = new PublicKey(
  "3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E",
);

// btc
// export const PYTH_PRICE_INFO = new PublicKey(
//   "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J",
// );
// export const PYTH_PRODUCT_INFO = new PublicKey(
//   "3m1y5h2uv7EQL3KaJZehvAJa4yDNvgc5yAdL9KPMKwvk",
// );

export const ENDPOINT = "https://psytrbhymqlkfrhudd.dev.genesysgo.net:8899/";

export const SKIP_PREFLIGHT = true;

//sprint: account
export const EVERLASTING_ACCOUNT = new PublicKey(
  "DdYzkZSRvK9EAtTZcUUMeAydYq62V5YFx6YFa5Y19FSz",
);

export const USDC_MINT_ADDRESS = new PublicKey(
  "ANPW6n3x5YEbqsAM9tGteXRuQAhFcG1XQq75gbQFajP8",
);

export const USDC_MINT_AUTH_ADDRESS = new PublicKey(
  "5t1Goi4tfDueXRuDqNVx6Kw5BE3fEKBFNEvHTTP1YYPc",
);

export const EVERLASTING_MARKET = new PublicKey(
  "7htE41GPCgnom2Q1ChT4qh7wcpFWq94RfeUexBmsHjXw"
)

export const DEX_MARKET = new PublicKey(
  "CiakMn8A53zQQPCauHUH2bGiWnTSNymGBiwzTqGwfAQt"
)

export const LOT_SIZE = 1000

export const FEE = 0.2

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
