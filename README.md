# 01 TypeScript Client SDK

TypeScript SDK for interacting with the 01 Solana program.

## Installation

Using npm

```bash
npm install
```

## Devnet token faucet 
Replace `<WALLET>`, `<MINT>`, and `<AMOUNT>`
```bash 
curl -XPOST 'https://devnet-faucet.01.xyz?owner=<WALLET>&mint=<MINT>&amount=<AMOUNT>'
```

## Markets
| Symbol      | Cluster | Base Lots | Quote Lots |
| ----------- | ------- | --------- | ---------- |
| BTC-PERP    | Devnet  | 100       | 10         |

## Collaterals 
| Symbol      | Cluster | Mint                                         | Decimals |
| ----------- | ------- | -------------------------------------------- | -------- |
| USDC        | Devnet  | 7UT1javY6X1M9R2UrPGrwcZ78SX3huaXyETff5hm5YdX | 6        |
| BTC         | Devnet  | 3n3sMJMnZhgNDaxp6cfywvjHLrV1s34ndfa6xAaYvpRs | 6        |
| SOL         | Devnet  | 8FXJqPB6xrjpWKoURnGeubPbXTcanjV4KSsN8gQYqdvM | 9        |

## Usage examples

[Setup](#setup) | [Deposit/ Withdraw/ Swap](#deposit) | [Trading](#trading)

### <a name="setup"></a> Setup

The following example shows how to run basic setup instructions.

```typescript
// Setup the program and provider
const program = anchor.workspace.Zo as Program<Zo>;

// Load the state
let state: State = await State.load(program, stateKey);

// Create a margin account (which also creates the control account)
let margin: Margin = await Margin.create(program, state);

// Create a PerpOpenOrders account (to be created for every market)
const MARKET_SYMBOL = "BTC-PERP";
await margin.createPerpOpenOrders(MARKET_SYMBOL);
```

### <a name="deposit"></a> Deposit/ Withdraw/ Swap

The following example shows how to deposit, withdraw and swap from a margin account.

```typescript
// Deposit
let depositAmount = new BN(50 * 10 ** USDC_DECIMALS); // $50
let repayOnly = false;
const stateUsdcVault = state.getVaultCollateralByMint(USDC_MINT)[0];
await margin.deposit(usdcTokenAcc, stateUsdcVault, depositAmount, repayOnly);

// Withdraw
let withdrawAmount = new BN(140 * 10 ** USDC_DECIMALS);
let allowBorrow = false;
await margin.withdraw(
  usdcTokenAcc,
  stateUsdcVault,
  withdrawAmount,
  allowBorrow,
);

// Swap USDC to Token B (or vice versa)
let buy = true;
let amount = 20 * 10 ** USDC_DECIMALS;
let minRate = new BN(1);
let allowSwapBorrow = false;

await margin.swap({
  buy,
  tokenMint: TOKEN_B_MINT,
  amount,
  minRate,
  allowBorrow: allowSwapBorrow,
  serumMarket: SERUM_SPOT_MARKET,
});
```

### <a name="trading"></a> Trading

The following example shows to perform trading actions.

```typescript
// Place an order
let price = 50_000;
let size = 0.004;
let isLong = true;
const orderType: OrderType = { limit: {} };

await margin.placePerpOrder({
  symbol: MARKET_SYMBOL,
  orderType: orderType,
  isLong,
  limitPrice,
  maxBaseQty,
  maxQuoteQty,
});

// Fetch Market
const marketKey = state.getMarketKeyBySymbol(MARKET_SYMBOL);
const market = await ZoMarket.load(
  program.provider.connection,
  marketKey,
  {},
  DEX_PROGRAM_ID,
);

// Fetch orders per user
const orders = await market.loadOrdersForOwner(
  program.provider.connection,
  margin.control.pubkey,
);

// Fetch orderbook
const bids = await ts.zoMarket.loadBids(program.provider.connection);
const asks = await ts.zoMarket.loadAsks(program.provider.connection);

// L2 orderbook data
for (const [price, size] of bids.getL2(20)) {
  console.log(price, size);
}

// Full orderbook data
for (const order of asks) {
  console.log(
    order.orderId,
    order.price,
    order.size,
    order.side, // 'buy' or 'sell'
  );
}

// Cancel an order
const orderIsLong = true;
await margin.cancelPerpOrder(MARKET_SYMBOL, orderIsLong);

// Settle funds
await margin.settleFunds(MARKET_SYMBOL);
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
