/// <reference types="bn.js" />
import { PublicKey } from "@solana/web3.js";
import { BN, Program } from "@project-serum/anchor";
import BaseAccount from "./BaseAccount";
import Cache from "./Cache";
import { ZoMarket } from "../zoDex/zoMarket";
import { StateSchema, Zo } from "../types";
declare type CollateralInfo = Omit<StateSchema["collaterals"][0], "oracleSymbol"> & {
    oracleSymbol: string;
};
declare type PerpMarket = Omit<StateSchema["perpMarkets"][0], "symbol" | "oracleSymbol"> & {
    symbol: string;
    oracleSymbol: string;
};
export interface Schema extends Omit<StateSchema, "perpMarkets" | "collaterals"> {
    perpMarkets: PerpMarket[];
    collaterals: CollateralInfo[];
}
/**
 * The state account defines program-level parameters, and tracks listed markets and supported collaterals.
 */
export default class State extends BaseAccount<Schema> {
    readonly signer: PublicKey;
    readonly cache: Cache;
    _getMarketBySymbol: {
        [k: string]: ZoMarket;
    };
    private constructor();
    /**
     * Gets the state signer's pda account and bump.
     * @returns An array consisting of the state signer pda and bump.
     */
    static getSigner(stateKey: PublicKey, programId: PublicKey): Promise<[PublicKey, number]>;
    /**
     * @param k The state's public key.
     */
    static load(program: Program<Zo>, k: PublicKey): Promise<State>;
    private static fetch;
    refresh(): Promise<void>;
    /**
     * Get the index of the collateral in the State's collaterals list using the mint public key.
     * @param mint The mint's public key.
     */
    getCollateralIndex(mint: PublicKey): number;
    /**
     * Get the vault public key and the CollateralInfo object for a collateral using the mint public key.
     * @param mint The mint's public key.
     * @returns The vault public key and the CollateralInfo object.
     */
    getVaultCollateralByMint(mint: PublicKey): [PublicKey, Schema["collaterals"][0]];
    /**
     * Get the index of a market in the State's PerpMarkets list using the market symbol.
     * @param sym The market symbol. Ex:("BTC-PERP")
     */
    getMarketIndexBySymbol(sym: string): number;
    getMarketKeyBySymbol(sym: string): PublicKey;
    getMarketBySymbol(sym: string): Promise<ZoMarket>;
    /**
     * Called by the keepers every hour to update the funding on each market.
     * @param symbol The market symbol. Ex:("BTC-PERP")
     */
    updatePerpFunding(symbol: string): Promise<string>;
    /**
     * Called by the keepers regularly to cache the oracle prices.
     * @param mockPrices Only used for testing purposes. An array of user-set prices.
     */
    cacheOracle(mockPrices?: BN[]): Promise<string>;
    /**
     * Called by the keepers to update the borrow and supply multipliers.
     * @param start The inclusive start index of the collateral array.
     * @param end The exclusive end index of the collateral array.
     */
    cacheInterestRates(start: number, end: number): Promise<string>;
}
export {};
