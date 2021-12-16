import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { Market as SerumMarket } from "@project-serum/serum";
import BN from "bn.js";
import { Buffer } from "buffer";
import BaseAccount from "./BaseAccount";
import State from "./State";
import Control from "./Control";
import Num from "../Num";
import { loadWI80F48 } from "../utils";
import { Zo, MarginSchema, OrderType, TransactionId } from "../types";
import {
  CONTROL_ACCOUNT_SIZE,
  DEX_PROGRAM_ID,
  SERUM_SPOT_PROGRAM_ID,
  SERUM_SWAP_PROGRAM_ID,
} from "../config";
import Decimal from "decimal.js";
import Cache from "./Cache";

interface Schema extends Omit<MarginSchema, "collateral"> {
  rawCollateral: Decimal[];
  actualCollateral: Num[];
}

export default class Margin extends BaseAccount<Schema> {
  private constructor(
    program: Program<Zo>,
    pubkey: PublicKey,
    data: Schema,
    public readonly control: Control,
    public readonly state: State,
  ) {
    super(program, pubkey, data);
  }

  private static async fetch(
    program: Program<Zo>,
    k: PublicKey,
    st: State,
    ch: Cache,
  ): Promise<Schema> {
    const data = (await program.account["margin"].fetch(k)) as MarginSchema;
    let rawCollateral = data.collateral
      .map((c) => loadWI80F48(c!))
      .slice(0, st.data.totalCollaterals);
    return {
      ...data,
      rawCollateral,
      actualCollateral: st.data.collaterals.map(
        (c, i) =>
          new Num(
            new BN(
              rawCollateral[i]!.isPos()
                ? rawCollateral[i]!.times(
                    ch.data.borrowCache[i]!.supplyMultiplier,
                  )
                    .floor()
                    .toString()
                : rawCollateral[i]!.times(
                    ch.data.borrowCache[i]!.borrowMultiplier,
                  )
                    .floor()
                    .toString(),
            ),
            c.decimals,
            c.mint,
          ),
      ),
    };
  }

  static async load(
    program: Program<Zo>,
    st: State,
    ch: Cache,
  ): Promise<Margin> {
    const [key, _nonce] = await this.getPda(
      st,
      program.provider.wallet.publicKey,
      program.programId,
    );
    let data = await this.fetch(program, key, st, ch);
    let control = await Control.load(program, data.control);
    return new this(program, key, data, control, st);
  }

  static async create(program: Program<Zo>, st: State): Promise<Margin> {
    const conn = program.provider.connection;
    const [[key, nonce], control, controlLamports] = await Promise.all([
      this.getPda(st, program.provider.wallet.publicKey, program.programId),
      Keypair.generate(),
      conn.getMinimumBalanceForRentExemption(CONTROL_ACCOUNT_SIZE),
    ]);
    await conn.confirmTransaction(
      await program.rpc.createMargin(nonce, {
        accounts: {
          state: st.pubkey,
          authority: program.provider.wallet.publicKey,
          margin: key,
          control: control.publicKey,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
        preInstructions: [
          SystemProgram.createAccount({
            fromPubkey: program.provider.wallet.publicKey,
            newAccountPubkey: control.publicKey,
            lamports: controlLamports,
            space: CONTROL_ACCOUNT_SIZE,
            programId: program.programId,
          }),
        ],
        signers: [control],
      }),
    );
    return await Margin.load(program, st, st.cache);
  }

  static async getPda(
    st: State,
    traderKey: PublicKey,
    programId: PublicKey,
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [traderKey.toBuffer(), st.pubkey.toBuffer(), Buffer.from("marginv1")],
      programId,
    );
  }

  async refresh(): Promise<void> {
    [this.data] = await Promise.all([
      Margin.fetch(this.program, this.pubkey, this.state, this.state.cache),
      this.control.refresh(),
      this.state.refresh(),
    ]);
  }

  async getOpenOrdersKey(symbol: string): Promise<[PublicKey, number]> {
    const dexMarket = this.state.getMarketKeyBySymbol(symbol);
    return await PublicKey.findProgramAddress(
      [this.data.control.toBuffer(), dexMarket.toBuffer()],
      DEX_PROGRAM_ID,
    );
  }

  async getOpenOrdersBySymbol(
    symbol: string,
    create: boolean = true,
  ): Promise<Control["data"]["openOrdersAgg"][0] | null> {
    const marketIndex = this.state.getSymbolIndex(symbol);
    let oo = this.control.data.openOrdersAgg[marketIndex];
    if (oo!.key.equals(PublicKey.default)) {
      if (create) {
        await this.createPerpOpenOrders(symbol);
        oo = this.control.data.openOrdersAgg[marketIndex];
      } else {
        return null;
      }
    }
    return oo!;
  }

  async deposit(
    tokenAccount: PublicKey,
    vault: PublicKey,
    amount: BN,
    repayOnly: boolean,
  ) {
    return await this.program.rpc.deposit(repayOnly, amount, {
      accounts: {
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        cache: this.state.cache.pubkey,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        tokenAccount,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
  }

  async withdraw(
    tokenAccount: PublicKey,
    vault: PublicKey,
    amount: BN,
    allowBorrow: boolean,
  ) {
    return await this.program.rpc.withdraw(allowBorrow, amount, {
      accounts: {
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        cache: this.state.cache.pubkey,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        control: this.data.control,
        tokenAccount,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
  }

  async createPerpOpenOrders(symbol: string): Promise<string> {
    const [ooKey, _] = await this.getOpenOrdersKey(symbol);
    return await this.program.rpc.createPerpOpenOrders({
      accounts: {
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        control: this.data.control,
        openOrders: ooKey,
        dexMarket: this.state.getMarketKeyBySymbol(symbol),
        dexProgram: DEX_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      },
    });
  }

  async placePerpOrder({
    symbol,
    orderType,
    isLong,
    limitPrice,
    maxBaseQty,
    maxQuoteQty,
  }: Readonly<{
    symbol: string;
    orderType: OrderType;
    isLong: boolean;
    limitPrice: BN;
    maxBaseQty: BN;
    maxQuoteQty: BN;
  }>): Promise<TransactionId> {
    const market = await this.state.getMarketBySymbol(symbol);
    const oo = await this.getOpenOrdersBySymbol(symbol);

    return await this.program.rpc.placePerpOrder(
      isLong,
      limitPrice,
      maxBaseQty,
      maxQuoteQty,
      orderType,
      {
        accounts: {
          state: this.state.pubkey,
          stateSigner: this.state.signer,
          cache: this.state.cache.pubkey,
          authority: this.wallet.publicKey,
          margin: this.pubkey,
          control: this.control.pubkey,
          openOrders: oo!.key,
          dexMarket: market.address,
          reqQ: market.requestQueueAddress,
          eventQ: market.eventQueueAddress,
          marketBids: market.bidsAddress,
          marketAsks: market.asksAddress,
          dexProgram: DEX_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        },
      },
    );
  }

  async cancelPerpOrder(symbol: string, isLong: boolean, orderId: BN) {
    const market = await this.state.getMarketBySymbol(symbol);
    const oo = await this.getOpenOrdersBySymbol(symbol);

    return await this.program.rpc.cancelPerpOrder(orderId, isLong, {
      accounts: {
        state: this.state.pubkey,
        cache: this.state.cache.pubkey,
        authority: this.wallet.publicKey,
        margin: this.pubkey,
        control: this.control.pubkey,
        openOrders: oo!.key,
        dexMarket: market.address,
        marketBids: market.bidsAddress,
        marketAsks: market.asksAddress,
        eventQ: market.eventQueueAddress,
        dexProgram: DEX_PROGRAM_ID,
      },
    });
  }

  async swap({
    buy,
    tokenMint,
    amount,
    minRate,
    allowBorrow,
    serumMarket,
  }: Readonly<{
    buy: boolean;
    tokenMint: PublicKey;
    amount: BN;
    minRate: BN;
    allowBorrow: boolean;
    serumMarket: PublicKey;
  }>): Promise<TransactionId> {
    if (this.state.data.totalCollaterals < 1) {
      throw new Error(
        `<State ${this.state.pubkey.toString()}> does not have a base collateral`,
      );
    }

    const market = await SerumMarket.load(
      this.connection,
      serumMarket,
      {},
      SERUM_SPOT_PROGRAM_ID,
    );

    const colIdx = this.state.getCollateralIndex(tokenMint);
    const stateQuoteMint = this.state.data.collaterals[0]!.mint;

    if (
      !market.baseMintAddress.equals(tokenMint) ||
      !market.quoteMintAddress.equals(stateQuoteMint)
    ) {
      throw new Error(
        `Invalid <SerumSpotMarket ${serumMarket}> for swap:\n` +
          `  swap wants:   base=${tokenMint}, quote=${stateQuoteMint}\n` +
          `  market wants: base=${market.baseMintAddress}, quote=${market.quoteMintAddress}`,
      );
    }

    return await this.program.rpc.swap(buy, allowBorrow, amount, minRate, {
      accounts: {
        authority: this.wallet.publicKey,
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        cache: this.state.data.cache,
        margin: this.pubkey,
        control: this.data.control,
        quoteMint: stateQuoteMint,
        quoteVault: this.state.data.vaults[0]!,
        assetMint: tokenMint,
        assetVault: this.state.getVaultCollateralByMint(tokenMint)[0],
        swapFeeVault: this.state.data.swapFeeVault,
        serumOpenOrders: this.state.data.collaterals[colIdx]!.serumOpenOrders,
        serumMarket,
        serumRequestQueue: market.decoded.requestQueue,
        serumEventQueue: market.decoded.eventQueue,
        serumBids: market.bidsAddress,
        serumAsks: market.asksAddress,
        serumCoinVault: market.decoded.baseVault,
        serumPcVault: market.decoded.quoteVault,
        serumVaultSigner: market.decoded.vaultSignerNonce,
        srmSpotProgram: SERUM_SPOT_PROGRAM_ID,
        srmSwapProgram: SERUM_SWAP_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    });
  }

  async settleFunds(symbol: string) {
    const market = await this.state.getMarketBySymbol(symbol);
    const oo = await this.getOpenOrdersBySymbol(symbol);

    return await this.program.rpc.settleFunds({
      accounts: {
        authority: this.wallet.publicKey,
        state: this.state.pubkey,
        stateSigner: this.state.signer,
        cache: this.state.data.cache,
        margin: this.pubkey,
        control: this.data.control,
        openOrders: oo!.key,
        dexMarket: market.address,
        dexProgram: DEX_PROGRAM_ID,
      },
    });
  }
}
