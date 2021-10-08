import { DEX_PROGRAM_ID } from "../config";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { AccountClient, BN, Program } from "@project-serum/anchor";
import BaseAccount from "./BaseAccount";
import { getMintInfo, createMint, createTokenAccount } from "../utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Market } from "../serum/market";
import TokenAccountBalance from "./TokenAccountBalance";

export interface Schema {
  nonce: number;
  admin: PublicKey;
  vAssetLotSize: BN;
  vQuoteLotSize: BN;
  strike: BN;
  dexMarket: PublicKey;
  bids: PublicKey;
  asks: PublicKey;
  reqQ: PublicKey;
  eventQ: PublicKey;
  vAssetMint: PublicKey;
  vAssetVault: PublicKey;
  vQuoteMint: PublicKey;
  vQuoteVault: PublicKey;
}

export default class EverlastingMarket extends BaseAccount<Schema> {
  private constructor(
    pubKey: PublicKey,
    program: Program,
    accountClient: AccountClient,
    data: Readonly<Schema>,
    public readonly vAssetDecimals: number,
    public readonly vQuoteDecimals: number,
    public readonly dexMarketAcc: Market,
  ) {
    super(pubKey, program, accountClient, data);
  }

  static async getEverlastingMarketPda(
    program: Program,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from("everlastingv1")],
      program.programId,
    );
  }

  static async init({
    program,
    vAssetDecimals,
    vQuoteDecimals,
    vAssetLotSize,
    vQuoteLotSize,
    vQuoteDustThreshold,
    strike,
  }: Readonly<{
    program: Program;
    vAssetDecimals: number;
    vQuoteDecimals: number;
    vAssetLotSize: BN;
    vQuoteLotSize: BN;
    vQuoteDustThreshold: BN;
    strike: BN;
  }>): Promise<EverlastingMarket> {
    const conn = program.provider.connection;
    const provider = program.provider;
    const wallet = program.provider.wallet;

    const dexMarket = Keypair.generate();
    const asks = Keypair.generate();
    const bids = Keypair.generate();
    const reqQ = Keypair.generate();
    const eventQ = Keypair.generate();

    const [everlastingMarketKey, nonce] = await PublicKey.findProgramAddress(
      [Buffer.from("everlastingv1")],
      program.programId,
    );

    const [vaultOwner, vaultSignerNonce] = (await (async function () {
      const nonce = new BN(0);
      while (true) {
        try {
          const vaultOwner = await PublicKey.createProgramAddress(
            [
              dexMarket.publicKey.toBuffer(),
              nonce.toArrayLike(Buffer, "le", 8),
            ],
            DEX_PROGRAM_ID,
          );
          return [vaultOwner, nonce];
        } catch (_) {
          nonce.iaddn(1);
        }
      }
    })()) as [PublicKey, BN];

    const vAssetMint = await createMint(
      provider,
      everlastingMarketKey,
      vAssetDecimals,
    );
    const vAssetVault = await createTokenAccount(
      provider,
      vAssetMint,
      vaultOwner,
    );
    const vQuoteMint = await createMint(
      provider,
      everlastingMarketKey,
      vQuoteDecimals,
    );
    const vQuoteVault = await createTokenAccount(
      provider,
      vQuoteMint,
      vaultOwner,
    );

    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: dexMarket.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(1464 + 12),
        space: 1464 + 12,
        programId: DEX_PROGRAM_ID,
      }),
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: reqQ.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(5120 + 12),
        space: 5120 + 12,
        programId: DEX_PROGRAM_ID,
      }),
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: eventQ.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(262144 + 12),
        space: 262144 + 12,
        programId: DEX_PROGRAM_ID,
      }),
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: bids.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(65536 + 12),
        space: 65536 + 12,
        programId: DEX_PROGRAM_ID,
      }),
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: asks.publicKey,
        lamports: await conn.getMinimumBalanceForRentExemption(65536 + 12),
        space: 65536 + 12,
        programId: DEX_PROGRAM_ID,
      }),
    );

    await conn.confirmTransaction(
      await provider.send(tx, [dexMarket, reqQ, eventQ, bids, asks]),
    );

    const tx2 = await program.rpc.initEverlastingMarket!(
      nonce,
      vaultSignerNonce,
      vAssetLotSize,
      vQuoteLotSize,
      vQuoteDustThreshold,
      strike,
      {
        accounts: {
          admin: wallet.publicKey,
          everlastingMarket: everlastingMarketKey,
          vAssetMint,
          vAssetVault,
          vQuoteMint: vQuoteMint,
          vQuoteVault: vQuoteVault,
          dexMarket: dexMarket.publicKey,
          bids: bids.publicKey,
          asks: asks.publicKey,
          reqQ: reqQ.publicKey,
          eventQ: eventQ.publicKey,
          dexProgram: DEX_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      },
    );
    return await this.load(everlastingMarketKey, program);
  }

  static async load(
    pubkey: PublicKey,
    program: Program,
  ): Promise<EverlastingMarket> {
    const client = program.account.everlastingMarket!;
    const data = (await client.fetch(pubkey)) as Schema;

    return new this(
      pubkey,
      program,
      client,
      data,
      (await getMintInfo(program.provider, data.vAssetMint)).decimals,
      (await getMintInfo(program.provider, data.vQuoteMint)).decimals,
      await Market.load(
        program.provider.connection,
        data.dexMarket,
        {},
        DEX_PROGRAM_ID,
      ),
    );
  }

  get strike() {
    //todo: constant params
    return new TokenAccountBalance(this.data.strike, 6);
  }

  priceToLots = (p: number): BN =>
    new BN(
      Math.round(
        (p *
          Math.pow(10, this.vQuoteDecimals) *
          this.data.vQuoteLotSize.toNumber()) /
          (Math.pow(10, this.vAssetDecimals) *
            this.data.vAssetLotSize.toNumber()),
      ),
    );

  assetSizeToLots = (s: number): BN =>
    new BN(Math.round(s * Math.pow(10, this.vAssetDecimals))).div(
      this.data.vAssetLotSize,
    );

  quoteSizeToLots = (s: number): BN =>
    new BN(Math.round(s * Math.pow(10, this.vQuoteDecimals))).div(
      this.data.vQuoteLotSize,
    );

  async updateFunding({
    pythProductInfo,
    pythPriceInfo,
  }: Readonly<{
    pythProductInfo: PublicKey;
    pythPriceInfo: PublicKey;
  }>): Promise<String> {
    const tx = await this.program.rpc.updateEverlastingFunding!({
      accounts: {
        everMarket: this.pubKey,
        dexMarket: this.dexMarketAcc.address,
        marketBids: this.dexMarketAcc.bidsAddress,
        marketAsks: this.dexMarketAcc.asksAddress,
        pythProductInfo,
        pythPriceInfo,
        dexProgram: DEX_PROGRAM_ID,
      },
    });

    return tx;
  }
}
