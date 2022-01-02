import { Commitment, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import BN from "bn.js";
import BaseAccount from "./BaseAccount";
import State from "./State";
import Control from "./Control";
import Num from "../Num";
import { MarginSchema, OrderType, TransactionId, Zo } from "../types";
import Decimal from "decimal.js";
import Cache from "./Cache";
interface Schema extends Omit<MarginSchema, "collateral"> {
    /** The deposit amount divided by the entry supply or borrow multiplier */
    rawCollateral: Decimal[];
    /** The collateral value after applying supply/ borrow APY (i.e. the raw collateral multiplied by the current supply or borrow multiplier). */
    actualCollateral: Num[];
}
/**
 * The margin account is a PDA generated using
 * ```javascript
 * seeds=[userWalletKey, stateKey, "marginv1"]
 * ```.
 */
export default class Margin extends BaseAccount<Schema> {
    readonly control: Control;
    readonly state: State;
    private constructor();
    /**
     * Loads a new Margin object.
     */
    static load(program: Program<Zo>, st: State, ch: Cache): Promise<Margin>;
    /**
     * Creates a margin account.
     * @param program The Zo Program
     * @param st The Zo State object, overrides the default config.
     * @param commitment commitment of the transaction, finalized is used as default
     */
    static create(program: Program<Zo>, st: State, commitment?: Commitment): Promise<Margin>;
    /**
     * Gets the Margin account's PDA and bump.
     * @returns An array consisting of [PDA, bump]
     */
    static getPda(st: State, traderKey: PublicKey, programId: PublicKey): Promise<[PublicKey, number]>;
    private static fetch;
    /**
     * Refreshes the data on the Margin, state, cache and control accounts.
     */
    refresh(): Promise<void>;
    /**
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @returns The OpenOrders account key for the given market.
     */
    getOpenOrdersKeyBySymbol(symbol: string): Promise<[PublicKey, number]>;
    /**
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param create If true, creates the OpenOrders account if it doesn't exist.
     * @returns The OpenOrdersInfo for the given market.
     */
    getOpenOrdersInfoBySymbol(symbol: string, create?: boolean): Promise<Control["data"]["openOrdersAgg"][0] | null>;
    /**
     * Deposits a given amount of collateral into the Margin account. Raw implementation of the instruction.
     * @param tokenAccount The user's token account where tokens will be subtracted from.
     * @param vault The state vault where tokens will be deposited into.
     * @param amount The amount of tokens to deposit, in native quantity. (ex: lamports for SOL, satoshis for BTC)
     * @param repayOnly If true, will only deposit up to the amount borrowed. If true, amount parameter can be set to an arbitrarily large number to ensure that any outstanding borrow is fully repaid.
     */
    depositRaw(tokenAccount: PublicKey, vault: PublicKey, amount: BN, repayOnly: boolean): Promise<string>;
    /**
     * Deposits a given amount of SOL collateral into the Margin account. Raw implementation of the instruction.
     * @param vault The state vault where tokens will be deposited into.
     * @param amount The amount of tokens to deposit, in native quantity. (ex: lamports for SOL, satoshis for BTC)
     * @param repayOnly If true, will only deposit up to the amount borrowed. If true, amount parameter can be set to an arbitrarily large number to ensure that any outstanding borrow is fully repaid.
     */
    depositSol(vault: PublicKey, amount: BN, repayOnly: boolean): Promise<string>;
    /**
     * Withdraws a given amount of collateral from the Margin account to a specified token account. If withdrawing more than the amount deposited, then account will be borrowing.
     * Raw implementation of the instruction.
     * @param vault The state vault where tokens will be withdrawn from.
     * @param amount The amount of tokens to withdraw, in native quantity. (ex: lamports for SOL, satoshis for BTC)
     * @param allowBorrow If false, will only be able to withdraw up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully withdrawn.
     */
    withdrawSol(vault: PublicKey, amount: BN, allowBorrow: boolean): Promise<string>;
    /**
     * Deposits a given amount of collateral into the Margin account from the associated token account.
     * @param mint Mint of the collateral being deposited.
     * @param size The amount of tokens to deposit, in big units. (ex: 1.5 SOL, or 0.5 BTC)
     * @param repayOnly If true, will only deposit up to the amount borrowed. If true, amount parameter can be set to an arbitrarily large number to ensure that any outstanding borrow is fully repaid.
     * @param tokenAccountProvided optional param to provide the token account to use it for deposits
     */
    deposit(mint: PublicKey, size: number, repayOnly: boolean, tokenAccountProvided?: PublicKey): Promise<string>;
    /**
     * Withdraws a given amount of collateral from the Margin account to a specified token account. If withdrawing more than the amount deposited, then account will be borrowing.
     * Raw implementation of the instruction.
     * @param tokenAccount The user's token account where tokens will be withdrawn to.
     * @param vault The state vault where tokens will be withdrawn from.
     * @param amount The amount of tokens to withdraw, in native quantity. (ex: lamports for SOL, satoshis for BTC)
     * @param allowBorrow If false, will only be able to withdraw up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully withdrawn.
     * @param preInstructions instructions executed before withdrawal
     */
    withdrawRaw(tokenAccount: PublicKey, vault: PublicKey, amount: BN, allowBorrow: boolean, preInstructions: TransactionInstruction[] | undefined): Promise<string>;
    /**
     * Withdraws a given amount of collateral from the Margin account to a specified token account. If withdrawing more than the amount deposited, then account will be borrowing.
     * @param mint of the collateral being withdrawn
     * @param size The amount of tokens to withdraw, in big units. (ex: 1.5 SOL, or 0.5 BTC)
     * @param allowBorrow If false, will only be able to withdraw up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully withdrawn.
     */
    withdraw(mint: PublicKey, size: number, allowBorrow: boolean): Promise<string>;
    /**
     * User must create a perp OpenOrders account for every perpetual market(future and or options) they intend to trade on.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     */
    createPerpOpenOrders(symbol: string): Promise<string>;
    /**
     * Raw implementation of the instruction rpc call.
     * Places an order on the orderbook for a given market, using lot sizes for limit and base quantity, and native units for quote quantity.
     * Assumes an open orders account has been created already.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param orderType The order type. Either limit, immediateOrCancel, or postOnly.
     * @param isLong True if buy, false if sell.
     * @param limitPrice The limit price in base lots per quote lots.
     * @param maxBaseQty The maximum amount of base lots to buy or sell.
     * @param maxQuoteQty The maximum amount of native quote, including fees, to pay or receive.
     * @param limit If this order is taking, the limit sets the number of maker orders the fill will go through, until stopping and posting. If running into compute unit issues, then set this number lower.
     */
    placePerpOrderRaw({ symbol, orderType, isLong, limitPrice, maxBaseQty, maxQuoteQty, limit, clientId, }: Readonly<{
        symbol: string;
        orderType: OrderType;
        isLong: boolean;
        limitPrice: BN;
        maxBaseQty: BN;
        maxQuoteQty: BN;
        limit?: number;
        clientId?: BN;
    }>): Promise<TransactionId>;
    /**
     * Places a perp order on the orderbook. Creates an Open orders account if does not exist, in the same transaction.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param orderType The order type. Either limit, immediateOrCancel, or postOnly.
     * @param isLong True if buy, false if sell.
     * @param price The limit price in big quote units per big base units. Ex: (50,000 USD/SOL)
     * @param size The maximum amount of big base units to buy or sell.
     * @param limit If this order is taking, the limit sets the number of maker orders the fill will go through, until stopping and posting. If running into compute unit issues, then set this number lower.
     * @param clientId Used to tag an order with a unique id, which can be used to cancel this order through cancelPerpOrderByClientId. For optimal use, make sure all ids for every order is unique.
     */
    placePerpOrder({ symbol, orderType, isLong, price, size, limit, clientId, }: Readonly<{
        symbol: string;
        orderType: OrderType;
        isLong: boolean;
        price: number;
        size: number;
        limit?: number;
        clientId?: number;
    }>): Promise<TransactionId>;
    /**
     * Cancels an order on the orderbook for a given market by order id.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param isLong True if the order being cancelled is a buy order, false if sell order.
     * @param orderId The order id of the order to cancel. To get order id, call loadOrdersForOwner through the market.
     */
    cancelPerpOrder(symbol: string, isLong: boolean, orderId: BN): Promise<string>;
    /**
     * Cancels an order on the orderbook for a given market that was pre-assigned a unique clientId.
     * @param symbol The market symbol. Ex: ("BTC-PERP")
     * @param clientId The client id that was assigned to the order when it was placed.
     */
    cancelPerpOrderByClientId(symbol: string, clientId: number): Promise<string>;
    /**
     * Swaps between USDC and a given Token B (or vice versa) on the Serum Spot DEX. This is a direct IOC trade that instantly settles.
     * Note that the token B needs to be swappable, as enabled by the 01 program.
     * @param buy If true, then swapping USDC for Token B. If false, the swapping Token B for USDC.
     * @param tokenMint The mint public key of Token B.
     * @param fromSize The amount of tokens to swap *from*. If buy, this is USDC. If not buy, this is Token B. This is in big units (ex: 0.5 BTC or 1.5 SOL, not satoshis nor lamports).
     * @param toSize The amount of tokens to swap *to*. In other words, the amount of expected to tokens. If buy, this is Token B. If not buy, this is USDC. This is in big units (ex: 0.5 BTC or 1.5 SOL, not satoshis nor lamports).
     * @param slippage The tolerance for the amount of tokens received changing from its expected toSize. Number between 0 - 1, if 1, then max slippage.
     * @param allowBorrow If false, will only be able to swap up to the amount deposited. If false, amount parameter can be set to an arbitrarily large number to ensure that all deposits are fully swapped.
     * @param serumMarket The market public key of the Serum Spot DEX.
     */
    swap({ buy, tokenMint, fromSize, toSize, slippage, allowBorrow, serumMarket, }: Readonly<{
        buy: boolean;
        tokenMint: PublicKey;
        fromSize: number;
        toSize: number;
        slippage: number;
        allowBorrow: boolean;
        serumMarket: PublicKey;
    }>): Promise<TransactionId>;
    /**
     * Settles unrealized funding and realized PnL into the margin account for a given market.
     * @param symbol Market symbol (ex: BTC-PERP).
     */
    settleFunds(symbol: string): Promise<string>;
}
export {};
