import {
  Keypair,
  PublicKey,
  Connection,
  SystemProgram,
  Transaction,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Provider, BN } from "@project-serum/anchor";
import State from "./accounts/State";
import Margin from "./accounts/Margin";
import { createMint, createTokenAccount, mintTo, createProgram } from "./utils";
import { ZO_DEX_PROGRAM_ID } from "./config";

const usdcMint = new PublicKey("7UT1javY6X1M9R2UrPGrwcZ78SX3huaXyETff5hm5YdX");
const btcMint = new PublicKey("3n3sMJMnZhgNDaxp6cfywvjHLrV1s34ndfa6xAaYvpRs");
const solMint = new PublicKey("8FXJqPB6xrjpWKoURnGeubPbXTcanjV4KSsN8gQYqdvM");

export function devnetProgram() {
  const conn = new Connection("https://api.devnet.solana.com", "confirmed");
  const provider = Provider.local();
  // @ts-ignore
  provider.connection = conn;
  const program = createProgram(provider);
  return program;
}

export async function setupCollaterals(st: State) {
  const program = devnetProgram();
  const provider = program.provider;

  await program.rpc.addCollateral("USDC", 1000, true, 700, 100, 1000, 20, 10, {
    accounts: {
      admin: provider.wallet.publicKey,
      state: st.pubkey,
      stateSigner: st.signer,
      cache: st.cache.pubkey,
      vault: await createTokenAccount(provider, usdcMint, st.signer),
      mint: usdcMint,
    },
  });

  await program.rpc.addCollateral("BTC", 1000, true, 700, 100, 1000, 20, 10, {
    accounts: {
      admin: provider.wallet.publicKey,
      state: st.pubkey,
      stateSigner: st.signer,
      cache: st.cache.pubkey,
      vault: await createTokenAccount(provider, btcMint, st.signer),
      mint: btcMint,
    },
  });

  await program.rpc.addCollateral("SOL", 1000, true, 700, 100, 1000, 20, 10, {
    accounts: {
      admin: provider.wallet.publicKey,
      state: st.pubkey,
      stateSigner: st.signer,
      cache: st.cache.pubkey,
      vault: await createTokenAccount(provider, solMint, st.signer),
      mint: solMint,
    },
  });

}

export async function setup() {
  const conn = new Connection("https://api.devnet.solana.com", "confirmed");
  const provider = Provider.local();
  // @ts-ignore
  provider.connection = conn;
  const program = createProgram(provider);

  const stateKey = Keypair.generate();
  const cacheKey = Keypair.generate();

  const [stateSigner, signerNonce] = await PublicKey.findProgramAddress(
    [stateKey.publicKey.toBuffer()],
    program.programId,
  );

  let tx = await program.rpc.initState(signerNonce, {
    accounts: {
      admin: provider.wallet.publicKey,
      state: stateKey.publicKey,
      stateSigner: stateSigner,
      swapFeeVault: new PublicKey(
        "7VqqKxXjxmr8umyNhCkzdf2cb9QvdSBKEeSeAmTzdJB4",
      ),
      cache: cacheKey.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      systemProgram: SystemProgram.programId,
    },
    preInstructions: [
      // needs to be created outside program because account size too large
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: stateKey.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(8 + 9184),
        space: 8 + 9184,
        programId: program.programId,
      }),
      SystemProgram.createAccount({
        fromPubkey: provider.wallet.publicKey,
        newAccountPubkey: cacheKey.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(8 + 11100),
        space: 8 + 11100,
        programId: program.programId,
      }),
    ],
    signers: [stateKey, cacheKey],
  });
  await conn.confirmTransaction(tx);

  const st = await State.load(program, stateKey.publicKey);

  await program.rpc.addOracle("USDC", 6, 6, [{ pyth: {} }], {
    accounts: {
      admin: st.data.admin,
      state: st.pubkey,
      cache: st.data.cache,
    },
    remainingAccounts: [
      {
        isSigner: false,
        isWritable: false,
        pubkey: new PublicKey("5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7"),
      },
    ],
  });

  await program.rpc.addOracle("BTC", 6, 6, [{ pyth: {} }], {
    accounts: {
      admin: st.data.admin,
      state: st.pubkey,
      cache: st.data.cache,
    },
    remainingAccounts: [
      {
        isSigner: false,
        isWritable: false,
        pubkey: new PublicKey("HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J"),
      },
    ],
  });

  await program.rpc.addOracle("SOL", 8, 6, [{ pyth: {} }], {
    accounts: {
      admin: st.data.admin,
      state: st.pubkey,
      cache: st.data.cache,
    },
    remainingAccounts: [
      {
        isSigner: false,
        isWritable: false,
        pubkey: new PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"),
      },
    ],
  });

  let btcPerpDexMarket = Keypair.generate();
  let btcPerpAsks = Keypair.generate();
  let btcPerpBids = Keypair.generate();
  let btcPerpReqQ = Keypair.generate();
  let btcPerpEventQ = Keypair.generate();

  const tx0 = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: btcPerpDexMarket.publicKey,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(
        1360 + 12,
      ),
      space: 1360 + 12,
      programId: ZO_DEX_PROGRAM_ID,
    }),
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: btcPerpReqQ.publicKey,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(
        5120 + 12,
      ),
      space: 5120 + 12,
      programId: ZO_DEX_PROGRAM_ID,
    }),
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: btcPerpEventQ.publicKey,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(
        262144 + 12,
      ),
      space: 262144 + 12,
      programId: ZO_DEX_PROGRAM_ID,
    }),
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: btcPerpBids.publicKey,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(
        65536 + 12,
      ),
      space: 65536 + 12,
      programId: ZO_DEX_PROGRAM_ID,
    }),
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: btcPerpAsks.publicKey,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(
        65536 + 12,
      ),
      space: 65536 + 12,
      programId: ZO_DEX_PROGRAM_ID,
    }),
  );
  await provider.connection.confirmTransaction(
    await provider.send(tx0, [
      btcPerpDexMarket,
      btcPerpReqQ,
      btcPerpEventQ,
      btcPerpBids,
      btcPerpAsks,
    ]),
  );

  await program.rpc.initPerpMarket(
    "BTC-PERP",
    "BTC",
    { future: {} },
    new BN(100),
    new BN(10),
    new BN(0),
    new BN(100),
    new BN(20),
    new BN(6),
    {
      accounts: {
        state: st.pubkey,
        stateSigner: st.signer,
        admin: provider.wallet.publicKey,
        cache: st.cache.pubkey,
        dexMarket: btcPerpDexMarket.publicKey,
        bids: btcPerpBids.publicKey,
        asks: btcPerpAsks.publicKey,
        reqQ: btcPerpReqQ.publicKey,
        eventQ: btcPerpEventQ.publicKey,
        dexProgram: ZO_DEX_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    },
  );

  return st;
}
