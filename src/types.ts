import { PublicKey, Transaction } from "@solana/web3.js";

export interface MarketInfo {
  name: string;
  address: PublicKey;
  programId: PublicKey;
}

export interface Wallet {
  publicKey: PublicKey;
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}
