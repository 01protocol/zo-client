import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { TokenAccountBalance } from "./accounts/TokenAccountBalance";

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

export interface BopAccountInit {
  connection: Connection;
  wallet: any;
  initializer: PublicKey;
  masterLp: PublicKey;
  latestBop: PublicKey;
  pythProductInfo: PublicKey;
  pythPriceInfo: PublicKey;
}

export interface BopAccountData {
  isResolved: boolean;
  nonce: number;
  masterLp: PublicKey;
  strikePrice: TokenAccountBalance;
  finalPrice: TokenAccountBalance;
  expiryTimestamp: TokenAccountBalance;
  tradingClosingBuffer: TokenAccountBalance;
  tvl: TokenAccountBalance;
  initialLiquidityReceived: TokenAccountBalance;
  vReserveShares: TokenAccountBalance;
  vLongAmount: TokenAccountBalance;
  vShortAmount: TokenAccountBalance;
  availableLiquidityInShares: TokenAccountBalance;
  liquidityInjectionRatio: TokenAccountBalance;
  pythProductInfo: PublicKey;
  pythPriceInfo: PublicKey;
  lpLeftToWithdraw: TokenAccountBalance;
  withdrawLpHolding: PublicKey;
  withdrawCollateralHolding: PublicKey;
}

export interface BinaryPositionData {
  nonce: number;
  trader: PublicKey;
  marginAccount: PublicKey;
  masterLp: PublicKey;
  latestBop: PublicKey;
  isLong: boolean;
  avgSharePrice: TokenAccountBalance;
  shares: TokenAccountBalance;
  initialDeposit: TokenAccountBalance;
  borrowAmount: TokenAccountBalance;
  unclaimedCollateral: TokenAccountBalance;
  lastActivityTimestamp: Date;
}

export interface MasterLpData {
  manager: PublicKey;
  nonce: TokenAccountBalance;
  maxLiquidityAlloc: TokenAccountBalance;
  liquidityInjectionRatio: TokenAccountBalance;
  startingLiquidityInShares: TokenAccountBalance;
  expirationCycle: TokenAccountBalance;
  tradingClosingBuffer: TokenAccountBalance;
  tradingFee: TokenAccountBalance;
  lpFee: TokenAccountBalance;
  latestBop: PublicKey;
  pythProductInfo: PublicKey;
  pythPriceInfo: PublicKey;
  collateralMint: PublicKey;
  collateralVaultAccount: PublicKey;
  lpMint: PublicKey;
}

export interface MasterLpInit {
  connection: Connection;
  initializer: PublicKey;
  wallet: any;
  pythProductInfo: PublicKey;
  pythPriceInfo: PublicKey;
  collateralMint: PublicKey;
  maxLiquidityAlloc: TokenAccountBalance;
  liquidityInjectionRatio: number;
  tradingFee: number;
  lpFee: number;
  expirationCycle: number;
  tradingClosingBuffer: number;
  startingLiquidityInShares: number;
}

export interface WithdrawReceiptData {
  staker: PublicKey;
  bop: PublicKey;
  isClaimed: boolean;
  amountLpToWithdraw: TokenAccountBalance;
  collateralReturn: TokenAccountBalance;
}

export interface EverlastingData {
  manager: PublicKey;
  version: number;
  nonce: number;
  symbol: string;
  contractDecimals: number;
  collateralDecimals: number;
  marketPda: PublicKey;
  vault: PublicKey;
  pythProductInfo: PublicKey;
  pythPriceInfo: PublicKey;
  maintenanceMargin: TokenAccountBalance;
  floatingStrike: TokenAccountBalance;
  totalLongPositions: TokenAccountBalance;
  totalShortPositions: TokenAccountBalance;
  fundingRatio: TokenAccountBalance;
  fundingIndex: TokenAccountBalance;
  lastFundingTimestamp: TokenAccountBalance;
  k: TokenAccountBalance;
  vContractAmount: TokenAccountBalance;
  vCollateralAmount: TokenAccountBalance;
}

export interface EverlastingPositionData {
  nonce: number;
  trader: PublicKey;
  market: PublicKey;
  isLong: boolean;
  isActive: boolean;
  margin: TokenAccountBalance;
  borrowedAmount: TokenAccountBalance;
  avgEntryPrice: TokenAccountBalance;
  fundingEntryIndex: TokenAccountBalance;
  vContractAmount: TokenAccountBalance;
  vCollateralAmount: TokenAccountBalance;
  lastActivityTimestamp: TokenAccountBalance;
}

export interface EverlastingMarginData {
  nonce: number;
  trader: PublicKey;
  freeCollateralAmount: TokenAccountBalance;
  lockedCollateralAmount: TokenAccountBalance;
  collateralTokenAccount: PublicKey;
}
