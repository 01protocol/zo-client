import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  Token,
  MintLayout,
  AccountLayout,
  MintInfo,
  u64,
} from "@solana/spl-token";
import { Provider } from "@project-serum/anchor";
import BN from "bn.js";
import Decimal from "decimal.js";

export * from "./rpc";
export * from "./units";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  let m = MintLayout.decode(data);
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
