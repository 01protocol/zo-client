import { PublicKey } from "@solana/web3.js";
import { BN, Program } from "@project-serum/anchor";
import { loadSymbol } from "../utils";
import BaseAccount from "./BaseAccount";
import Cache from "./Cache";
import { ZoMarket } from "../zoDex/zoMarket";
import { StateSchema, Zo } from "../types";
import {
  ZERO_ONE_DEVNET_PROGRAM_ID,
  ZO_DEX_DEVNET_PROGRAM_ID,
  ZO_DEX_MAINNET_PROGRAM_ID,
} from "../config";

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

export interface Schema
  extends Omit<StateSchema, "perpMarkets" | "collaterals"> {
  perpMarkets: PerpMarket[];
  collaterals: CollateralInfo[];
}

/**
 * The state account defines program-level parameters, and tracks listed markets and supported collaterals.
 */
export default class State extends BaseAccount<Schema> {
  _getMarketBySymbol: { [k: string]: ZoMarket } = {};

  private constructor(
    program: Program<Zo>,
    pubkey: PublicKey,
    data: Readonly<Schema>,
    public readonly signer: PublicKey,
    public readonly cache: Cache,
  ) {
    super(program, pubkey, data);
  }

  /**
   * Gets the state signer's pda account and bump.
   * @returns An array consisting of the state signer pda and bump.
   */
  static async getSigner(
    stateKey: PublicKey,
    programId: PublicKey,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress([stateKey.toBuffer()], programId);
  }

  /**
   * @param k The state's public key.
   */
  static async load(program: Program<Zo>, k: PublicKey): Promise<State> {
    const data = await this.fetch(program, k);
    const [signer, signerNonce] = await this.getSigner(k, program.programId);
    if (signerNonce !== data.signerNonce) {
      throw Error("Invalid state signer nonce");
    }
    const cache = await Cache.load(program, data.cache, data);
    return new this(program, k, data, signer, cache);
  }

  private static async fetch(
    program: Program<Zo>,
    k: PublicKey,
  ): Promise<Schema> {
    const data = (await program.account["state"].fetch(
      k,
      "recent",
    )) as StateSchema;

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

  async refresh(): Promise<void> {
    this._getMarketBySymbol = {};
    [this.data] = await Promise.all([
      State.fetch(this.program, this.pubkey),
      this.cache.refresh(),
    ]);
  }

  /**
   * Get the index of the collateral in the State's collaterals list using the mint public key.
   * @param mint The mint's public key.
   */
  getCollateralIndex(mint: PublicKey): number {
    const i = this.data.collaterals.findIndex((x) => x.mint.equals(mint));
    if (i < 0) {
      throw RangeError(
        `Invalid mint ${mint.toBase58()} for <State ${this.pubkey.toBase58()}>`,
      );
    }
    return i;
  }

  /**
   * Get the vault public key and the CollateralInfo object for a collateral using the mint public key.
   * @param mint The mint's public key.
   * @returns The vault public key and the CollateralInfo object.
   */
  getVaultCollateralByMint(
    mint: PublicKey,
  ): [PublicKey, Schema["collaterals"][0]] {
    const i = this.getCollateralIndex(mint);
    return [
      this.data.vaults[i] as PublicKey,
      this.data.collaterals[i] as Schema["collaterals"][0],
    ];
  }

  /**
   * Get the index of a market in the State's PerpMarkets list using the market symbol.
   * @param sym The market symbol. Ex:("BTC-PERP")
   */
  getMarketIndexBySymbol(sym: string): number {
    const i = this.data.perpMarkets.findIndex((x) => x.symbol === sym);
    if (i < 0) {
      throw RangeError(
        `Invalid symbol ${sym} for <State ${this.pubkey.toBase58()}>`,
      );
    }
    return i;
  }

  getMarketKeyBySymbol(sym: string): PublicKey {
    return this.data.perpMarkets[this.getMarketIndexBySymbol(sym)]
      ?.dexMarket as PublicKey;
  }

  async getMarketBySymbol(sym: string): Promise<ZoMarket> {
    if (!this._getMarketBySymbol[sym]) {
      this._getMarketBySymbol[sym] = await ZoMarket.load(
        this.connection,
        this.getMarketKeyBySymbol(sym),
        this.provider.opts,
        this.program.programId.equals(ZERO_ONE_DEVNET_PROGRAM_ID)
          ? ZO_DEX_DEVNET_PROGRAM_ID
          : ZO_DEX_MAINNET_PROGRAM_ID,
      );
    }
    return this._getMarketBySymbol[sym] as ZoMarket;
  }

  /**
   * Called by the keepers every hour to update the funding on each market.
   * @param symbol The market symbol. Ex:("BTC-PERP")
   */
  async updatePerpFunding(symbol: string) {
    const market = await this.getMarketBySymbol(symbol);
    return await this.program.rpc.updatePerpFunding({
      accounts: {
        state: this.pubkey,
        stateSigner: this.signer,
        cache: this.cache.pubkey,
        dexMarket: market.address,
        marketBids: market.bidsAddress,
        marketAsks: market.asksAddress,
        dexProgram: this.program.programId.equals(ZERO_ONE_DEVNET_PROGRAM_ID)
          ? ZO_DEX_DEVNET_PROGRAM_ID
          : ZO_DEX_MAINNET_PROGRAM_ID,
      },
    });
  }

  /**
   * Called by the keepers regularly to cache the oracle prices.
   * @param mockPrices Only used for testing purposes. An array of user-set prices.
   */
  async cacheOracle(mockPrices?: BN[]) {
    const oracles = this.cache.data.oracles;
    return await this.program.rpc.cacheOracle(
      oracles.map((x) => x.symbol),
      mockPrices ?? null,
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

  /**
   * Called by the keepers to update the borrow and supply multipliers.
   * @param start The inclusive start index of the collateral array.
   * @param end The exclusive end index of the collateral array.
   */
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
