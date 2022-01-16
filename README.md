# 01 TypeScript Client SDK

TypeScript SDK for interacting with the 01 Solana program.

[SDK Docs](https://01protocol.github.io/zo-client/)

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
SOL can be deposited directly using native lamports. You can get SOL either through Solana cli airdrop or at any airdrop faucet.

## Program
|       | Cluster | Pubkey                                       |
| ----- |---------|----------------------------------------------|
| State | Devnet  | HAdeMzG1ZuzhWnt26iyggLhYUen3YosXiD5sgDXJoNDY |

## Derivatives Markets
| Symbol      | Cluster | Base Lots | Quote Lots | Base Decimals |
| ----------- | ------- | --------- | ---------- | ------------- |
| BTC-PERP    | Devnet  | 100       | 10         | 6             |
| SOL-PERP    | Devnet  | 100       | 10         | 6             |
| AVAX-PERP   | Devnet  | 1000      | 10         | 8             |

## Spot Swap Markets 
| Symbol   | Cluster | Serum Market Key                             |
|----------| ------- |----------------------------------------------|
| BTC-USDC | Devnet  | 9vNzQmmG7c3aXuTdKKULQW2oGrYsfGZ1uRsMtgZ2APJF |

## Collaterals 
| Symbol      | Cluster | Mint                                         | Decimals |
| ----------- | ------- | -------------------------------------------- | -------- |
| USDC        | Devnet  | 7UT1javY6X1M9R2UrPGrwcZ78SX3huaXyETff5hm5YdX | 6        |
| BTC         | Devnet  | 3n3sMJMnZhgNDaxp6cfywvjHLrV1s34ndfa6xAaYvpRs | 6        |
| SOL         | Devnet  | So11111111111111111111111111111111111111112  | 9        |

## Usage examples

[Setup](#setup) | [Deposit/ Withdraw/ Swap](#deposit) | [Trading](#trading)

### <a name="setup"></a> Setup

The following example shows how to run basic setup instructions.

```typescript
// Setup the program and provider
const program = anchor.workspace.Zo as Program<Zo>;

// Load the state
const state: State = await State.load(program, stateKey);

// Create a margin account (which also creates a control account)
const margin: Margin = await Margin.create(program, state);

// Create a PerpOpenOrders account (to be created for every market)
// This step is optional. Placing an order on a new market will also create the account automatically.
const MARKET_SYMBOL = "BTC-PERP";
await margin.createPerpOpenOrders(MARKET_SYMBOL);
```

### <a name="deposit"></a> Deposit/ Withdraw/ Swap

The following example shows how to deposit, withdraw and swap from a margin account.

```typescript
// Deposit
const depositSize = 50_250.25; // $50,250.25 USDC
const repayOnly = false;
await margin.deposit(usdcMintKey, depositSize, repayOnly);

// Withdraw
const withdrawSize = 0.001; // 0.001 BTC
const allowWithdrawBorrow = false;
await margin.withdraw(btcMintKey, withdrawSize, allowWithdrawBorrow);

// Swap USDC to Token B (or vice versa)
const buy = true;
const fromSize = 50_000; // $50,000.00 USDC
const toSize = 1; // 1 BTC
const slippage = 0.1; // 10% slippage tolerance
const allowSwapBorrow = false;
await margin.swap({
  buy,
  tokenMint: btcMintKey,
  fromSize,
  toSize,
  slippage,
  allowBorrow: allowSwapBorrow,
  serumMarket: btcUsdcSerumMarketKey,
});
```

### <a name="trading"></a> Trading

The following example shows to perform trading actions.

```typescript
// Place an order (automatically creates an openOrders account for you if placing on a new market)
const price = 50_000; // $50,000.00 per BTC
const size = 0.004; // 0.004 BTC
const isLong = true;
const clientId = 12; // optional clientId to uniquely tag orders (used in CancelPerpOrderByClientId)
const orderType: OrderType = { limit: {} };

await margin.placePerpOrder({
  symbol: MARKET_SYMBOL,
  orderType,
  isLong,
  price,
  size,
  clientId // optional arg
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
const bids = await market.loadBids(program.provider.connection);
const asks = await market.loadAsks(program.provider.connection);

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

// Cancel an order by order id
const orderIsLong = true;
const orderId = orders[0]; // or whichever order that is being cancelled
await margin.cancelPerpOrder(MARKET_SYMBOL, orderIsLong, orderId);

// Cancel an order by client id
await margin.cancelPerpOrderByClientId(MARKET_SYMBOL, clientId);


// Settle funds
await margin.settleFunds(MARKET_SYMBOL);
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
