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
import {
  createMint,
  createTokenAccount,
  createTokenAccountIxs,
} from "../utils";
import BaseAccount from "./BaseAccount";
import Cache from "./Cache";
import { Market } from "../serum/market";
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
  symbol: string;
};

interface Schema extends Omit<StateSchema, "perpMarkets"> {
  perpMarkets: PerpMarket[];
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

  static async getSigner(stateKey: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [stateKey.toBuffer()],
      this.program.programId,
    );
  }

  static async fetch(k: PublicKey): Promise<Schema> {
    let data = (await this.program.account["state"].fetch(k)) as StateSchema;
    // Convert StateSchema to Schema.
    const dec = new TextDecoder("utf-8");
    return {
      ...data,
      vaults: data.vaults.filter((k) => !k.equals(PublicKey.default)),
      collaterals: data.collaterals.filter(
        (c) => !c.mint.equals(PublicKey.default),
      ),
      // The perpMarkets that are filtered out are at the end, so
      // filter does not affect the index.
      perpMarkets: data.perpMarkets
        .filter((p) => !p.dexMarket.equals(PublicKey.default))
        .map((x) => {
          // Need to convert symbol, which is a [u8; 24], to a JS String.
          // Can't use String.fromCodePoint since that takes in u16,
          // when we are receiving a UTF-8 byte array.

          // Find null char.
          let i = x.symbol.indexOf(0);
          i = i < 0 ? x.symbol.length : i;
          const symbol = dec.decode(new Uint8Array(x.symbol.slice(0, i)));

          return {
            ...x,
            symbol,
          };
        }, new Map()),
    };
  }

  static async load(k: PublicKey): Promise<State> {
    const data = await this.fetch(k);
    const [signer, signerNonce] = await this.getSigner(k);
    if (signerNonce !== data.signerNonce) {
      throw Error("Invalid state signer nonce");
    }
    const cache = await Cache.load(data.cache);
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

  async refresh(): Promise<void> {
    this.data = await State.fetch(this.pubkey);
  }

  getMintVaultCollateral(
    mint: PublicKey,
  ): [PublicKey, Schema["collaterals"][0]] {
    const i = this.data.collaterals.findIndex((x) => x.mint.equals(mint));
    if (i < 0) {
      throw RangeError(
        `Invalid mint ${mint.toBase58()} for <State ${this.pubkey.toBase58()}>`,
      );
    }
    return [
      this.data.vaults[i] as PublicKey,
      this.data.collaterals[i] as Schema["collaterals"][0],
    ];
  }

  getSymbolIndex(sym: string): number {
    const i = this.data.perpMarkets.findIndex((x) => x.symbol === sym);
    if (i < 0) {
      throw RangeError(
        `Invalid symbol ${sym} for <State ${this.pubkey.toBase58()}>`,
      );
    }
    return i;
  }

  getSymbolMarketKey(sym: string): PublicKey {
    return this.data.perpMarkets[this.getSymbolIndex(sym)]
      ?.dexMarket as PublicKey;
  }

  _getSymbolMarket: { [k: string]: Market } = {};
  async getSymbolMarket(sym: string): Promise<Market> {
    if (!this._getSymbolMarket[sym]) {
      this._getSymbolMarket[sym] = await Market.load(
        this.connection,
        this.getSymbolMarketKey(sym),
        this.provider.opts,
        DEX_PROGRAM_ID,
      );
    }
    return this._getSymbolMarket[sym] as Market;
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

  async addCollateral({
    weight,
    mint,
    oracle,
    fallbackOracle,
  }: Readonly<{
    weight: number;
    mint: PublicKey;
    oracle?: PublicKey;
    fallbackOracle?: PublicKey;
  }>) {
    const vault = Keypair.generate();
    await this.program.rpc.addCollateral(
      weight,
      oracle !== undefined,
      fallbackOracle !== undefined,
      {
        accounts: {
          admin: this.data.admin,
          state: this.pubkey,
          stateSigner: this.signer,
          cache: this.cache.pubkey,
          vault,
          mint,
          oracle: oracle ?? PublicKey.default,
          fallback: fallbackOracle ?? PublicKey.default,
        },
        instructions: [
          ...(await createTokenAccountIxs(
            vault,
            this.provider,
            mint,
            this.signer,
          )),
        ],
        signers: [vault],
      },
    );
  }

  async updateCollateral({
    weight,
    mint,
    oracle,
    hasFallbackOracle,
    fallbackOracle,
  }: Readonly<{
    weight: number | null;
    mint: PublicKey;
    oracle: PublicKey | null;
    hasFallbackOracle: boolean | null;
    fallbackOracle: PublicKey | null;
  }>) {
    await this.program.rpc.updateCollateral(
      weight,
      oracle,
      hasFallbackOracle,
      fallbackOracle,
      {
        accounts: {
          admin: this.data.admin,
          state: this.pubkey,
          cache: this.cache.pubkey,
          mint,
        },
      },
    );
  }

  async addInsurance(x: BN, tokenAccount: PublicKey, vault: PublicKey) {
    await this.program.rpc.addInsurance(x, {
      accounts: {
        state: this.pubkey,
        stateSigner: this.signer,
        authority: this.wallet.publicKey,
        tokenAccount,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
  }

  async reduceInsurance(x: BN, tokenAccount: PublicKey, vault: PublicKey) {
    await this.program.rpc.reduceInsurance(x, {
      accounts: {
        state: this.pubkey,
        stateSigner: this.signer,
        admin: this.data.admin,
        tokenAccount,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
  }

  async realizeMarketFees(sym: string) {
    await this.program.rpc.realizeMarketFees({
      accounts: {
        state: this.pubkey,
        stateSigner: this.signer,
        signer: this.signer,
        dexMarket: this.getSymbolMarketKey(sym),
        dexProgram: DEX_PROGRAM_ID,
      },
    });
  }

  async initPerpMarket({
    symbol,
    perpType,
    vAssetLotSize,
    vQuoteLotSize,
    strike,
    minMmf,
    baseImf,
    oracle,
    fallbackOracle,
    coinDecimals,
  }: Readonly<{
    symbol: string;
    perpType: PerpType;
    vAssetLotSize: number;
    vQuoteLotSize: number;
    strike: BN;
    minMmf: number;
    baseImf: number;
    coinDecimals: number;
    oracle: PublicKey;
    fallbackOracle: PublicKey;
  }>) {
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
    ] = await Promise.all([
      this.connection.getMinimumBalanceForRentExemption(
        DEX_MARKET_ACCOUNT_SIZE,
      ),
      this.connection.getMinimumBalanceForRentExemption(REQ_Q_ACCOUNT_SIZE),
      this.connection.getMinimumBalanceForRentExemption(EVENT_Q_ACCOUNT_SIZE),
      this.connection.getMinimumBalanceForRentExemption(BIDS_ACCOUNT_SIZE),
      this.connection.getMinimumBalanceForRentExemption(ASKS_ACCOUNT_SIZE),
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
      perpType,
      vAssetLotSize,
      vQuoteLotSize,
      strike,
      minMmf,
      baseImf,
      coinDecimals,
      {
        accounts: {
          state: this.pubkey,
          stateSigner: this.signer,
          admin: this.data.admin,
          cache: this.data.cache,
          dexMarket: dexMarket.publicKey,
          bids: bids.publicKey,
          asks: asks.publicKey,
          reqQ: reqQ.publicKey,
          eventQ: eventQ.publicKey,
          dexProgram: DEX_PROGRAM_ID,
          oracle,
          fallback: fallbackOracle,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      },
    );
  }

  async updatePerpFunding(symbol: string) {
    const market = await this.getSymbolMarket(symbol);
    await this.program.rpc.updatePerpFunding({
      accounts: {
        state: this.pubkey,
        stateSigner: this.signer,
        cache: this.cache.pubkey,
        dexMarket: market.address,
        marketBids: market.bidsAddress,
        marketAsks: market.asksAddress,
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
