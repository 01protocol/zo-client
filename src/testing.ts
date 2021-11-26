import State from "./accounts/State";
import Margin from "./accounts/Margin";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { createMint, createTokenAccount } from "./utils";

export async function testSetup(): Promise<[State, Margin]> {
  const st = await State.init();

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
    mint: await createMint(st.provider, st.wallet.publicKey, 6),
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
    symbol: "BTC-PERP",
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

  let m = await Margin.create(st);
  m.placePerpOrder({
    symbol: "BTC-PERP",
    isLong: true,
    orderType: { limit: {} },
    limitPrice: new BN(0.5 * 1_000_000),
    maxBaseQty: new BN(4),
    maxQuoteQty: new BN(2 * 1_000_000),
  });

  return [st, m];
}
