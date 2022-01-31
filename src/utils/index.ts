import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  AccountLayout as TokenAccountLayout,
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintInfo,
  MintLayout,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";
import { Program, Provider } from "@project-serum/anchor";
import BN from "bn.js";
import Decimal from "decimal.js";
import { blob, struct, u8 } from "buffer-layout";
import { Zo } from "../types";
import {
  IDL,
  RENT_PROGRAM_ID,
  WRAPPED_SOL_MINT,
  ZERO_ONE_DEVNET_PROGRAM_ID,
  ZERO_ONE_MAINNET_PROGRAM_ID,
} from "../config";

export * from "../types/dataTypes";

export * from "./rpc";
export * from "./units";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export enum Cluster {
  Devnet = "Devnet",
  Mainnet = "Mainnet",
}

export function createProgram(
  provider: Provider,
  cluster: Cluster,
): Program<Zo> {
  if (cluster === Cluster.Devnet) {
    return new Program<Zo>(IDL, ZERO_ONE_DEVNET_PROGRAM_ID, provider);
  } else {
    return new Program<Zo>(IDL, ZERO_ONE_MAINNET_PROGRAM_ID, provider);
  }
}

export function loadWI80F48({ data }: { data: BN }): Decimal {
  return new Decimal(
    `${data.isNeg() ? "-" : ""}0b${data.abs().toString(2)}p-48`,
  );
}

const utf8Decoder = new TextDecoder("utf-8");

export function loadSymbol({ data: s }: { data: number[] }): string {
  // Need to convert symbol, which is a [u8; 24], to a JS String.
  // Can't use String.fromCodePoint since that takes in u16,
  // when we are receiving a UTF-8 byte array.
  let i = s.indexOf(0);
  i = i < 0 ? s.length : i;
  return utf8Decoder.decode(new Uint8Array(s.slice(0, i)));
}

/**
 * Instead of returning -1 if the element is not found,
 * return `array.length`. Much easier to use for slicing.
 */
export function findIndexOf<T>(l: readonly T[], p: (T) => boolean) {
  for (let i = 0; i < l.length; ++i) {
    if (p(l[i])) {
      return i;
    }
  }
  return l.length;
}

export function findLastIndexOf<T>(l: readonly T[], p: (T) => boolean) {
  for (let i = l.length - 1; i >= 0; --i) {
    if (p(l[i])) {
      return i;
    }
  }
  return -1;
}

export async function getMintInfo(
  provider: Provider,
  pubkey: PublicKey,
): Promise<MintInfo> {
  const data = (await provider.connection.getAccountInfo(pubkey))?.data;
  if (!data) throw Error(`Couldn't load mint data for ${pubkey.toBase58()}`);
  const m = MintLayout.decode(data);
  return {
    mintAuthority: new PublicKey(m.mintAuthority),
    supply: u64.fromBuffer(m.supply),
    decimals: m.decimals,
    isInitialized: !!m.isInitialized,
    freezeAuthority: new PublicKey(m.freezeAuthority),
  };
}

export async function createMintIxs(
  mint: Keypair,
  provider: Provider,
  authority: PublicKey,
  decimals: number,
  freezeAuthority?: PublicKey,
): Promise<TransactionInstruction[]> {
  return [
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MintLayout.span,
      lamports: await Token.getMinBalanceRentForExemptMint(provider.connection),
      programId: TOKEN_PROGRAM_ID,
    }),
    Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      decimals,
      authority,
      freezeAuthority ?? null,
    ),
  ];
}

export async function createTokenAccountIxs(
  vault: Keypair,
  provider: Provider,
  mint: PublicKey,
  owner: PublicKey,
): Promise<TransactionInstruction[]> {
  return [
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: vault.publicKey,
      space: AccountLayout.span,
      lamports: await Token.getMinBalanceRentForExemptAccount(
        provider.connection,
      ),
      programId: TOKEN_PROGRAM_ID,
    }),
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      vault.publicKey,
      owner,
    ),
  ];
}

export function createMintToIxs(
  mint: PublicKey,
  dest: PublicKey,
  authority: PublicKey,
  amount: number,
): TransactionInstruction[] {
  return [
    Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      dest,
      authority,
      [],
      amount,
    ),
  ];
}

export async function createMint(
  provider: Provider,
  authority: PublicKey,
  decimals: number,
  freezeAuthority?: PublicKey,
): Promise<PublicKey> {
  const mint = new Keypair();
  const tx = new Transaction();
  tx.add(
    ...(await createMintIxs(
      mint,
      provider,
      authority,
      decimals,
      freezeAuthority,
    )),
  );
  await provider.send(tx, [mint]);
  return mint.publicKey;
}

export async function createTokenAccount(
  provider: Provider,
  mint: PublicKey,
  owner: PublicKey,
): Promise<PublicKey> {
  const vault = Keypair.generate();
  const tx = new Transaction();
  tx.add(...(await createTokenAccountIxs(vault, provider, mint, owner)));
  await provider.send(tx, [vault]);
  return vault.publicKey;
}

export async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey,
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID,
    )
  )[0];
}

export function getAssociatedTokenTransactionWithPayer(
  tokenMintAddress: PublicKey,
  associatedTokenAddress: PublicKey,
  owner: PublicKey,
) {
  const keys = [
    {
      pubkey: owner,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: owner,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: tokenMintAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: RENT_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    },
  ];

  return new TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
}

export async function mintTo(
  provider: Provider,
  mint: PublicKey,
  dest: PublicKey,
  amount: number,
): Promise<void> {
  const tx = new Transaction();
  tx.add(...createMintToIxs(mint, dest, provider.wallet.publicKey, amount));
  await provider.send(tx, []);
}

export function throwIfNull<T>(
  value: T | null,
  message = "account not found",
): T {
  if (value === null) {
    throw new Error(message);
  }
  return value;
}

const MINT_LAYOUT = struct([blob(44), u8("decimals"), blob(37)]);

export async function getMintDecimals(
  connection: Connection,
  mint: PublicKey,
): Promise<number> {
  if (mint.equals(WRAPPED_SOL_MINT)) {
    return 9;
  }
  const { data } = throwIfNull(
    await connection.getAccountInfo(mint),
    "mint not found",
  );
  const { decimals } = MINT_LAYOUT.decode(data);
  return decimals;
}

export async function getWrappedSolInstructionsAndKey(
  initialSmollAmount,
  provider,
): Promise<{
  createTokenAccountIx: TransactionInstruction;
  initTokenAccountIx: TransactionInstruction;
  closeTokenAccountIx: TransactionInstruction;
  intermediary: PublicKey;
  intermediaryKeypair: Keypair;
}> {
  // sol wrapping code taken from jet: https://github.com/jet-lab/jet-v1/blob/30c56d5c14b68685466164fc45c96080f1d9348a/app/src/scripts/jet.ts
  const intermediaryKeypair = Keypair.generate();
  const intermediary = intermediaryKeypair.publicKey;

  const rent = await provider.connection.getMinimumBalanceForRentExemption(
    TokenAccountLayout.span,
  );
  const createTokenAccountIx = SystemProgram.createAccount({
    fromPubkey: provider.wallet.publicKey,
    newAccountPubkey: intermediary,
    programId: TOKEN_PROGRAM_ID,
    space: TokenAccountLayout.span,
    lamports: parseInt(initialSmollAmount.addn(rent).toString()),
  });

  const initTokenAccountIx = Token.createInitAccountInstruction(
    TOKEN_PROGRAM_ID,
    WRAPPED_SOL_MINT,
    intermediary,
    provider.wallet.publicKey,
  );

  const closeTokenAccountIx = Token.createCloseAccountInstruction(
    TOKEN_PROGRAM_ID,
    intermediary,
    provider.wallet.publicKey,
    provider.wallet.publicKey,
    [],
  );

  return {
    createTokenAccountIx,
    initTokenAccountIx,
    closeTokenAccountIx,
    intermediary,
    intermediaryKeypair,
  };
}
