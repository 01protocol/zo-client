# 01 Client Library

Javascript library for interacting with the 01 Solana program.

## Installation

Using npm

```bash
npm install
```

## Usage example

The following example shows how to run basic instructions using the client.

```typescript
// Setup the program and provider
const program = anchor.workspace.Zo as Program<Zo>

// Load the state
let state: State = await State.load(program, stateKey)

// Create a margin account (which also creates the control account)
let margin: Margin = await Margin.create(program, state)

// Create a PerpOpenOrders account (to be created for every market)
const MARKET_SYMBOL = "BTC-PERP"
await margin.createPerpOpenOrders(MARKET_SYMBOL)

// Deposit
let depositAmount = new BN(50 * 10 ** USDC_DECIMALS) // $50
let repayOnly = false
const stateUsdcVault = state.getVaultCollateralByMint(USDC_MINT)[0]
await margin.deposit(
  usdcTokenAcc,
  stateUsdcVault,
  depositAmount,
  repayOnly
)

// Place an order
let price = 50_000
let size = 0.004
let isLong = true

const limitPrice: BN = priceNumberToLots(
  price,
  BASE_DECIMALS,
  BASE_LOT_SIZE,
  USDC_DECIMALS,
  USDC_BASE_LOT_SIZE
)
const maxBaseQty: BN = baseNumberToLots(size, BASE_DECIMALS, BASE_LOT_SIZE)
const maxQuoteQty: BN = limitPrice.mul(maxBaseQty).mul(USDC_BASE_LOT_SIZE)
const orderType: OrderType = { limit: {} }

await margin.placePerpOrder({
  symbol: MARKET_SYMBOL,
  orderType: orderType,
  isLong,
  limitPrice,
  maxBaseQty,
  maxQuoteQty 
})

// Fetch Market
const marketKey = state.getMarketKeyBySymbol(MARKET_SYMBOL)
const market = await ZoMarket.load(
  program.provider.connection,
  marketKey,
  {},
  DEX_PROGRAM_ID
)

// Fetch orders
const orders = await market.loadOrdersForOwner(
  program.provider.connection,
  margin.control.pubkey
)

// Cancel an order 
const orderIsLong = true
await margin.cancelPerpOrder(
  MARKET_SYMBOL,
  orderIsLong,
)

// Settle funds
await margin.settleFunds(MARKET_SYMBOL)

// Withdraw
let withdrawAmount = new BN(140 * 10 ** USDC_DECIMALS)
let allowBorrow = false
await margin.withdraw(
  usdcTokenAcc,
  stateUsdcVault,
  withdrawAmount,
  allowBorrow
)

// Swap USDC to Token B (or vice versa)
let buy = true
let amount = 20 * 10 ** USDC_DECIMALS
let minRate = new BN(1)
let allowSwapBorrow = false

await margin.swap({
  buy,
  tokenMint: TOKEN_B_MINT,
  amount,
  minRate,
  allowBorrow: allowSwapBorrow,
  serumMarket: SERUM_SPOT_MARKET
})
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
