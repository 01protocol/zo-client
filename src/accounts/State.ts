import { PublicKey } from "@solana/web3.js";
import { loadSymbol } from "../utils";
import BaseAccount from "./BaseAccount";
import Cache from "./Cache";
import { ZoMarket } from "../zoDex/zoMarket";
import { StateSchema } from "../types";
import { DEX_PROGRAM_ID } from "../config";
import { BN } from "@project-serum/anchor";

type CollateralInfo = Omit<StateSchema["collaterals"][0], "oracleSymbol"> & {
  oracleSymbol: string;
};

type PerpMarket = Omit<
  StateSchema["perpMarkets"][0],
  "symbol" | "oracleSymbol"
> & {
  symbol: string;
  oracleSymbol: string;
};

interface Schema extends Omit<StateSchema, "perpMarkets" | "collaterals"> {
  perpMarkets: PerpMarket[];
  collaterals: CollateralInfo[];
}

export default class State extends BaseAccount<Schema> {
  private constructor(
    pubkey: PublicKey,
    data: Readonly<Schema>,
    public readonly signer: PublicKey,
    public readonly cache: Cache,
  ) {
    super(pubkey, data);
  }

  static async getSigner(stateKey: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [stateKey.toBuffer()],
      this.program.programId,
    );
  }

  static async fetch(k: PublicKey): Promise<Schema> {
    const data = (await this.program.account["state"].fetch(k)) as StateSchema;

    // Convert StateSchema to Schema.
    return {
      ...data,
      vaults: data.vaults.slice(0, data.totalCollaterals),
      collaterals: data.collaterals
        .slice(0, data.totalCollaterals)
        .map((x) => ({
          ...x,
          oracleSymbol: loadSymbol(x.oracleSymbol),
        })),
      perpMarkets: data.perpMarkets.slice(0, data.totalMarkets).map((x) => ({
        ...x,
        symbol: loadSymbol(x.symbol),
        oracleSymbol: loadSymbol(x.oracleSymbol),
      })),
    };
  }

  static async load(k: PublicKey): Promise<State> {
    const data = await this.fetch(k);
    const [signer, signerNonce] = await this.getSigner(k);
    if (signerNonce !== data.signerNonce) {
      throw Error("Invalid state signer nonce");
    }
    const cache = await Cache.load(data.cache);
    return new this(k, data, signer, cache);
  }

  async refresh(): Promise<void> {
    this._getSymbolMarket = {};
    [this.data] = await Promise.all([
      State.fetch(this.pubkey),
      this.cache.refresh(),
    ]);
  }

  getCollateralIndex(mint: PublicKey): number {
    const i = this.data.collaterals.findIndex((x) => x.mint.equals(mint));
    if (i < 0) {
      throw RangeError(
        `Invalid mint ${mint.toBase58()} for <State ${this.pubkey.toBase58()}>`,
      );
    }
    return i;
  }

  getMintVaultCollateral(
    mint: PublicKey,
  ): [PublicKey, Schema["collaterals"][0]] {
    const i = this.getCollateralIndex(mint);
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

  _getSymbolMarket: { [k: string]: ZoMarket } = {};
  async getSymbolMarket(sym: string): Promise<ZoMarket> {
    if (!this._getSymbolMarket[sym]) {
      this._getSymbolMarket[sym] = await ZoMarket.load(
        this.connection,
        this.getSymbolMarketKey(sym),
        this.provider.opts,
        DEX_PROGRAM_ID,
      );
    }
    return this._getSymbolMarket[sym] as ZoMarket;
  }

  async updatePerpFunding(symbol: string) {
    const market = await this.getSymbolMarket(symbol);
    return await this.program.rpc.updatePerpFunding({
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

  async cacheOracle(mockPrices?: BN[]) {
    const oracles = this.cache.data.oracles;
    return await this.program.rpc.cacheOracle(
      oracles.map((x) => x.symbol),
      mockPrices,
      {
        accounts: {
          signer: this.wallet.publicKey,
          cache: this.cache.pubkey,
        },
        remainingAccounts: oracles
          .flatMap((x) => x.sources)
          .map((x) => ({
            isSigner: false,
            isWritable: false,
            pubkey: x.key,
          })),
      },
    );
  }

  async cacheInterestRates(start: number, end: number) {
    return await this.program.rpc.cacheInterestRates(start, end, {
      accounts: {
        signer: this.wallet.publicKey,
        state: this.pubkey,
        cache: this.data.cache,
      },
    });
  }
}
