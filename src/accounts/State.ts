import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import BN from "bn.js";
import { USDC_MINT_ADDRESS } from "../config";
import { createMint, createTokenAccount } from "../utils";
import BaseAccount from "./BaseAccount";
import Cache from "./Cache";
import { StateSchema, PerpType } from "../types";
import {
  DEX_PROGRAM_ID,
  STATE_ACCOUNT_SIZE,
  CACHE_ACCOUNT_SIZE,
  DEX_MARKET_ACCOUNT_SIZE,
  REQ_Q_ACCOUNT_SIZE,
  EVENT_Q_ACCOUNT_SIZE,
  BIDS_ACCOUNT_SIZE,
  ASKS_ACCOUNT_SIZE,
} from "../config";

type PerpMarket = Omit<StateSchema["perpMarkets"][0], "symbol"> & {
  index: number;
};

interface Schema extends Omit<StateSchema, "perpMarkets"> {
  // Map symbol to PerpMarket.
  perpMarkets: Map<string, PerpMarket>;
}

export default class State extends BaseAccount<Schema, "state"> {
  private constructor(
    pubkey: PublicKey,
    accClient: "state",
    data: Readonly<Schema>,
    public readonly signer: PublicKey,
    public readonly cache: Cache,
  ) {
    super(pubkey, accClient, data);
  }

  static processData(data: StateSchema): Schema {
    // Convert StateSchema to Schema. Need to convert symbol,
    // which is a [u8; 24], to a JS String. Can't use String.fromCodePoint
    // since that takes in u16, when we are receiving a UTF-8 byte array.
    const dec = new TextDecoder("utf-8");
    return {
      ...data,
      vaults: data.vaults.filter((k) => !k.equals(PublicKey.default)),
      collaterals: data.collaterals.filter(
        (c) => !c.mint.equals(PublicKey.default),
      ),
      perpMarkets: data.perpMarkets
        .filter((p) => !p.dexMarket.equals(PublicKey.default))
        .reduce((acc, x, index) => {
          // Find null char.
          let i = x.symbol.indexOf(0);
          i = i < 0 ? x.symbol.length : i;
          const symbol = dec.decode(new Uint8Array(x.symbol.slice(0, i)));

          acc[symbol] = {
            ...x,
            index,
          };
          return acc;
        }, new Map()),
    };
  }

  async refresh(): Promise<void> {
    this.data = State.processData(
      (await this.accountClient.fetch(this.pubkey)) as StateSchema,
    );
  }

  static async getSigner(stateKey: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [stateKey.toBuffer()],
      this.program.programId,
    );
  }

  static async load(k: PublicKey): Promise<State> {
    const rawData = (await this.program.account["state"]!.fetch(
      k,
    )) as StateSchema;
    const [signer, signerNonce] = await this.getSigner(k);
    if (signerNonce !== rawData.signerNonce) {
      throw Error("Invalid state signer nonce");
    }
    const cache = await Cache.load(rawData.cache);
    const data = this.processData(rawData);
    return new this(k, "state", data, signer, cache);
  }

  static async init(baseMint: PublicKey = USDC_MINT_ADDRESS): Promise<State> {
    const [state, cache, stateLamports, cacheLamports] = await Promise.all([
      Keypair.generate(),
      Keypair.generate(),
      this.connection.getMinimumBalanceForRentExemption(STATE_ACCOUNT_SIZE),
      this.connection.getMinimumBalanceForRentExemption(CACHE_ACCOUNT_SIZE),
    ]);

    const [stateSigner, signerNonce] = await this.getSigner(state.publicKey);

    const baseVault = await createTokenAccount(
      this.provider,
      baseMint,
      stateSigner,
    );

    await this.program.rpc.initState!(signerNonce, {
      accounts: {
        admin: this.wallet.publicKey,
        state: state.publicKey,
        stateSigner,
        baseMint,
        baseVault,
        cache: cache.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
      instructions: [
        // Accounts too big to be created in program.
        SystemProgram.createAccount({
          fromPubkey: this.wallet.publicKey,
          newAccountPubkey: state.publicKey,
          lamports: stateLamports,
          space: STATE_ACCOUNT_SIZE,
          programId: this.program.programId,
        }),
        SystemProgram.createAccount({
          fromPubkey: this.wallet.publicKey,
          newAccountPubkey: cache.publicKey,
          lamports: cacheLamports,
          space: CACHE_ACCOUNT_SIZE,
          programId: this.program.programId,
        }),
      ],
      signers: [state, cache],
    });

    return await State.load(state.publicKey);
  }

  async changeAdmin(newAdmin: PublicKey) {
    await this.program.rpc.changeAdmin({
      accounts: {
        state: this.pubkey,
        admin: this.wallet.publicKey,
        newAdmin,
      },
    });
  }

  async changeInsurance(x: BN, tokenAccount: PublicKey, vault: PublicKey) {
    await this.program.rpc[x.isNeg() ? "reduceInsurance" : "addInsurance"](
      x.abs(),
      {
        accounts: {
          state: this.pubkey,
          stateSigner: this.signer,
          admin: this.data.admin,
          tokenAccount,
          vault,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      },
    );
  }

  async realizeFees(dexMarket: PublicKey) {
    await this.program.rpc.realizeFees({
      accounts: {
        state: this.pubkey,
        stateSigner: this.signer,
        dexMarket,
        dexProgram: DEX_PROGRAM_ID,
      },
    });
  }

  async initPerpMarket(
    symbol: string,
    perpType: PerpType,
    vAssetDecimals: number,
    vQuoteDecimals: number,
    vAssetLotSize: number,
    vQuoteLotSize: number,
    strike: BN,
    oracle: PublicKey,
  ) {
    const [dexMarket, asks, bids, reqQ, eventQ] = [
      Keypair.generate(),
      Keypair.generate(),
      Keypair.generate(),
      Keypair.generate(),
      Keypair.generate(),
    ];
    const [
      dexMarketLamports,
      reqQLamports,
      eventQLamports,
      bidsLamports,
      asksLamports,
      vAssetMint,
      vQuoteMint,
    ] = await Promise.all([
      this.connection.getMinimumBalanceForRentExemption(
        DEX_MARKET_ACCOUNT_SIZE,
      ),
      this.connection.getMinimumBalanceForRentExemption(REQ_Q_ACCOUNT_SIZE),
      this.connection.getMinimumBalanceForRentExemption(EVENT_Q_ACCOUNT_SIZE),
      this.connection.getMinimumBalanceForRentExemption(BIDS_ACCOUNT_SIZE),
      this.connection.getMinimumBalanceForRentExemption(ASKS_ACCOUNT_SIZE),
      createMint(this.provider, this.signer, vAssetDecimals),
      createMint(this.provider, this.signer, vQuoteDecimals),
    ]);

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

    const [vAssetVault, vQuoteVault] = await Promise.all([
      createTokenAccount(this.provider, vAssetMint, vaultOwner),
      createTokenAccount(this.provider, vQuoteMint, vaultOwner),
    ]);

    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: this.wallet.publicKey,
        newAccountPubkey: dexMarket.publicKey,
        lamports: dexMarketLamports,
        space: DEX_MARKET_ACCOUNT_SIZE,
        programId: DEX_PROGRAM_ID,
      }),
      SystemProgram.createAccount({
        fromPubkey: this.wallet.publicKey,
        newAccountPubkey: reqQ.publicKey,
        lamports: reqQLamports,
        space: REQ_Q_ACCOUNT_SIZE,
        programId: DEX_PROGRAM_ID,
      }),
      SystemProgram.createAccount({
        fromPubkey: this.wallet.publicKey,
        newAccountPubkey: eventQ.publicKey,
        lamports: eventQLamports,
        space: EVENT_Q_ACCOUNT_SIZE,
        programId: DEX_PROGRAM_ID,
      }),
      SystemProgram.createAccount({
        fromPubkey: this.wallet.publicKey,
        newAccountPubkey: bids.publicKey,
        lamports: bidsLamports,
        space: BIDS_ACCOUNT_SIZE,
        programId: DEX_PROGRAM_ID,
      }),
      SystemProgram.createAccount({
        fromPubkey: this.wallet.publicKey,
        newAccountPubkey: asks.publicKey,
        lamports: asksLamports,
        space: ASKS_ACCOUNT_SIZE,
        programId: DEX_PROGRAM_ID,
      }),
    );
    await this.connection.confirmTransaction(
      await this.provider.send(tx, [dexMarket, reqQ, eventQ, bids, asks]),
    );

    await this.program.rpc.initPerpMarket(
      symbol,
      vaultSignerNonce,
      perpType,
      vAssetLotSize,
      vQuoteLotSize,
      strike,
      {
        accounts: {
          state: this.pubkey,
          stateSigner: this.signer,
          admin: this.data.admin,
          cache: this.data.cache,
          vAssetMint,
          vQuoteMint,
          vAssetVault,
          vQuoteVault,
          dexMarket: dexMarket.publicKey,
          bids: bids.publicKey,
          asks: asks.publicKey,
          reqQ: reqQ.publicKey,
          eventQ: eventQ.publicKey,
          dexProgram: DEX_PROGRAM_ID,
          oracle,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      },
    );
  }

  async updatePerpFunding(
    dexMarket: PublicKey,
    marketBids: PublicKey,
    marketAsks: PublicKey,
  ) {
    await this.program.rpc.updatePerpFunding({
      accounts: {
        state: this.pubkey,
        stateSigner: this.signer,
        cache: this.cache.pubkey,
        dexMarket,
        marketBids,
        marketAsks,
        dexProgram: DEX_PROGRAM_ID,
      },
    });
  }

  async cacheOracle() {
    await this.program.rpc.cacheOracle({
      accounts: {
        signer: this.signer,
        cache: this.cache.pubkey,
      },
    });
  }
}
