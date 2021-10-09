import {
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
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

export * from "./web3";
export { default as TokenAccountBalance } from "./TokenAccountBalance";

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

export async function createMint(
  provider: Provider,
  authority: PublicKey,
  decimals: number,
  freezeAuthority?: PublicKey,
): Promise<PublicKey> {
  const mint = new Keypair();
  const tx = new Transaction();
  tx.add(
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
  tx.add(
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
  );
  await provider.send(tx, [vault]);
  return vault.publicKey;
}
