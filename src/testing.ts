import State from "./accounts/State";
import Margin from "./accounts/Margin";
import { PublicKey } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";
import { createMint, createTokenAccount, mintTo } from "./utils";

export async function testSetup(): Promise<[State, Margin]> {
  const st = await State.init();
  const m = await Margin.create(st);
  const usdcMint = await createMint(st.provider, st.wallet.publicKey, 6);
  const wallet = await createTokenAccount(
    m.provider,
    usdcMint,
    m.wallet.publicKey,
  );
  await mintTo(st.provider, usdcMint, wallet, 500 * 1_000_000);

  await st.addOracle({
    symbol: "USDC/USD",
    baseDecimals: 6,
    quoteDecimals: 6,
    oracles: [
      [
        { pyth: {} },
        new PublicKey("5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7"),
      ],
      [
        { switchboard: {} },
        new PublicKey("CZx29wKMUxaJDq6aLVQTdViPL754tTR64NAgQBUGxxHb"),
      ],
    ],
  });

  await st.addOracle({
    symbol: "BTC/USD",
    baseDecimals: 8,
    quoteDecimals: 6,
    oracles: [
      [
        { pyth: {} },
        new PublicKey("HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J"),
      ],
      [
        { switchboard: {} },
        new PublicKey("74YzQPGUT9VnjrBz8MuyDLKgKpbDqGot5xZJvTtMi6Ng"),
      ],
    ],
  });

  await st.addCollateral({
    mint: usdcMint,
    oracleSymbol: "USDC/USD",
    weight: 10_000,
    isBorrowable: true,
    optimalUtil: 7000,
    optimalRate: 1000,
    maxRate: 10_000,
  });

  await st.addCollateral({
    mint: await createMint(st.provider, st.wallet.publicKey, 8),
    oracleSymbol: "BTC/USD",
    weight: 10_000,
    isBorrowable: true,
    optimalUtil: 7000,
    optimalRate: 1000,
    maxRate: 10_000,
  });

  await st.initPerpMarket({
    symbol: "local-BTC-PERP",
    oracleSymbol: "BTC/USD",
    perpType: { future: {} },
    vAssetLotSize: new BN(100),
    vQuoteLotSize: new BN(100),
    strike: new BN(0),
    minMmf: 650,
    baseImf: 1_000,
    coinDecimals: 8,
  });

  await st.refresh();

  let [vault, _] = st.getMintVaultCollateral(usdcMint);

  await m.deposit(wallet, vault, new BN(500 * 1_000_000), false);

  await m.placePerpOrder({
    symbol: "local-BTC-PERP",
    isLong: true,
    orderType: { limit: {} },
    limitPrice: new BN(0.5 * 1_000_000),
    maxBaseQty: new BN(4),
    maxQuoteQty: new BN(2 * 1_000_000),
  });

  await m.placePerpOrder({
    symbol: "local-BTC-PERP",
    isLong: false,
    orderType: { limit: {} },
    limitPrice: new BN(0.6 * 1_000_000),
    maxBaseQty: new BN(2),
    maxQuoteQty: new BN(1.2 * 1_000_000),
  });

  await m.refresh();

  return [st, m];
}
