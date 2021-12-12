import {Zo} from './types/idl';
import {PublicKey, Transaction} from '@solana/web3.js';
import {IdlAccounts, IdlTypes} from '@project-serum/anchor';
import BN from 'bn.js';

// TODO: DEPRECATE
export interface MarketInfo {
    name: string;
    address: PublicKey;
    programId: PublicKey;
}

// TODO: DEPRECATE
export interface Wallet {
    publicKey: PublicKey;

    signTransaction(tx: Transaction): Promise<Transaction>;

    signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
}

export {Zo} from './types/idl';

// NOTE: These intersection types are a temporary workaround,
// as anchor's type inference isn't complete yet.

export type OracleType = { pyth: {} } | { switchboard: {} };
export type PerpType = { future: {} } | { callOption: {} } | { putOption: {} };
export type OrderType =
    | { limit: {} }
    | { immediateOrCancel: {} }
    | { postOnly: {} };

type WrappedI80F48 = { data: BN };
type Symbol = { data: number[] };
type OracleSource = IdlTypes<Zo>['OracleSource'] & {
    ty: OracleType;
};
type CollateralInfo = Omit<IdlTypes<Zo>['CollateralInfo'],
    'oracleSymbol' | 'isBorrowable'> & {
    oracleSymbol: Symbol;
    isBorrowable: boolean;
};
type PerpMarketInfo = Omit<IdlTypes<Zo>['PerpMarketInfo'],
    'symbol' | 'oracleSymbol' | 'perpType'> & {
    symbol: Symbol;
    oracleSymbol: Symbol;
    perpType: PerpType;
};
type OpenOrdersInfo = Omit<IdlTypes<Zo>['OpenOrdersInfo'],'fundingIndex'> & {
    fundingIndex: BN;
};

type OracleCache = Omit<IdlTypes<Zo>['OracleCache'], 'symbol'> & {
    symbol: Symbol;
    sources: OracleSource[];
    price: WrappedI80F48;
    twap: WrappedI80F48;
};
type MarkCache = IdlTypes<Zo>['MarkCache'] & {
    price: WrappedI80F48;
    twap: {
        startTime: BN;
        open: WrappedI80F48;
        low: WrappedI80F48;
        high: WrappedI80F48;
        close: WrappedI80F48;
    }[];
};
type BorrowCache = Omit<IdlTypes<Zo>['BorrowCache'],
    'supply' | 'borrows' | 'supplyMultiplier' | 'borrowMultiplier'> & {
    supply: WrappedI80F48;
    borrows: WrappedI80F48;
    supplyMultiplier: WrappedI80F48;
    borrowMultiplier: WrappedI80F48;
};

export type StateSchema = IdlAccounts<Zo>['state'] & {
    collaterals: CollateralInfo[];
    perpMarkets: PerpMarketInfo[];
};
export type MarginSchema = Omit<IdlAccounts<Zo>['margin'], 'collateral'> & {
    collateral: WrappedI80F48[];
};
export type CacheSchema = IdlAccounts<Zo>['cache'] & {
    oracles: OracleCache[];
    marks: MarkCache[];
    fundingCache: BN[];
    borrowCache: BorrowCache[];
};
export type ControlSchema = IdlAccounts<Zo>['control'] & {
    openOrdersAgg: OpenOrdersInfo[];
};
