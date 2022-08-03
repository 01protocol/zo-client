
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres
to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.10.0] - 2022-08-03

- BREAKING: Margin's `withdraw` methods now take and additional `heimdall` account. Previous build's withdraw methods will fail.

## [0.9.9]

- General: updated anchor to 0.25.0
- MarginWeb3: Added support for simulation (not working due to some anchor bug)

## [0.9.8]

- OrderTypeInfo: Add `StopMarket`, `StopLimit`, `TakeProfitMarket`, `TakeProfitLimit`

## [0.9.6]

- Improved subscriptions by adding `stateLimit` and `cacheLimit` to limit the update frequency, add optional `withBackup` parameter
- Added change log to emitted events to help build a websocket

## [0.9.5]

- Zamm: created zamm class which allows to arb zamm and listen to its changes
- EventEmitters: improved EventEmitters and started to clean up old listeners
- ZoUser: made more methods directly accessible through zoUser removing the complexity of calling state or margin, and added ZoUser.load
- Linting: added universal linting config for 01 repositories

## [0.9.1]

- ZoUser: added a user class which allows interacting with 01 database, and provides a convenient wrapper

## [0.9.0]

- Margin, Control, State, Cache: Added subscriptions to changes 

## [0.8.15]

- Margin: Fixed `liqPrice` method

## [0.8.13]

- Config: Updated `ZO_SQUARE_TAKER_FEE` from 0.0015 to 0.002

## [0.8.12]

- State: Added `loadZoMarkets` method
- Margin: Fixed `toString` method

## [0.8.11]

- Margin: Added `toString` method

## [0.8.10]

- Margin: New `makeCancelPerpOrderIx`

## [0.8.9]

- Margin: Added `maxTs` to `placePerpOrder` ([#159](https://github.com/01protocol/zo-client/pull/159))
- BREAKING - cacheOracle: Updated instruction accounts ([#159](https://github.com/01protocol/zo-client/pull/159))

## [0.8.8]

- General: Optimized loading times

## [0.8.7]

- State: Add `getFundingInfo`, which returns a `FundingInfo` object. ([#127](https://github.com/01protocol/zo-client/pull/127))
- Cache: `MarkTwap`'s `TwapInfo` is reworked: ohlc is now deprecated, and `cumulAvg` represents the cumulative sum of the funding TWAP. ([#127](https://github.com/01protocol/zo-client/pull/127))

## [0.8.6]

- Margin: Fix RealizedPnl decimals
- General: Add `createProvider` function

## [0.8.5] - 2022-02-11

- State: fixed supply/borrow apy zero divisor check

## [0.8.4] - 2022-02-10

- Margin: Added method to create ix for `placePerpOrder`, will do so for more instructions ([#75](https://github.com/01protocol/zo-client/pull/75))

## [0.8.3] - 2022-02-07

- Margin: Replaced mark price with index price in liquidations related calculations ([#70](https://github.com/01protocol/zo-client/pull/70))

## [0.8.0] - 2022-02-07
- Margin: Added Power Perps Support
- Margin: Removed cache as param for MarginWeb3 Functions
- Margin: Added liquidation calculations to MarginWeb3
- Margin: Added margin exists function to check if margin exists
- Margin: Added state & cache subscriptions
- Program: Add FillOrKill order type. Acts as an IoC which fails if not completely filled ([#67](https://github.com/01protocol/zo-client/pull/67))

## [0.7.0] - 2022-01-31

- Margin: Margin now inherits MarginWeb3 which contains all the web3 logic related to fetching and loading
- Margin: now also contains math related logic for margin fractions calculation and other helper methods which can be use in liquidators & trading bots
- Margin: now also loads open orders for the account, and positions information
- State: now loads more detailed information about the markets & collaterals
- Cache: Fix mark cache's `lastSampleStartTime` decoding

## [0.5.1] - 2022-01-28

- Events: Added `marginKey` to `SwapLog` event

## [0.5.0] - 2022-01-27

- Mainnet: Mainnet keys added
- Program: `createProgram` now takes a `Cluster` argument

## [0.4.2] - 2022-01-24

- Margin: Added optional `owner` param to `Margin.load()`

## [0.4.1] - 2022-01-24

- Fix: changed `cancelPerpOrder` null operator

## [0.4.0] - 2022-01-24

- Fix: Update IDL

## [0.3.0] - 2022-01-24

- Margin: Removed `cancelPerpOrderByClientId` and merged it
  into `cancelPerpOrder` ([#52](https://github.com/01protocol/zo-client/pull/52))
- BREAKING - Program: The old Zo devnet program `DuSPvazsfthvWRuJ8TUs984VXCeUfJ1qbzd8NwkRLEpd`, and Zo Dex devnet
  program `CX8xiCu9uBrLX5v3DSeHX5SEvGT36PSExES2LmzVcyJd` is being decommissioned.

## [0.2.9] - 2022-01-21

- Spot: Added and enabled swapping for SOL-USDC spot market
- BREAKING - Margin: Added payer to createMargin and createPerpOpenOrders so that PDA's can be authorities of margin
  accounts during CPIs ([#51](https://github.com/01protocol/zo-client/pull/51))

## [0.2.8] - 2022-01-16

- Margin: Added reduceOnlyIoc and reduceOnlyLimit order types ([#49](https://github.com/01protocol/zo-client/pull/49))

## [0.2.7] - 2022-01-16

- General: updated anchor to newer version and enabled commitment
  passing ([#42](https://github.com/01protocol/zo-client/pull/42))
- Fix: fixed decimal errors on some decoding ([#42](https://github.com/01protocol/zo-client/pull/42))

## [0.2.6] - 2022-01-04

- Events: Added swap event ([#32](https://github.com/01protocol/zo-client/pull/32))
- Fix: Npm build ([#33](https://github.com/01protocol/zo-client/pull/38))

## [0.2.4] - 2022-01-01

- Events: Added anchor events and decoder ([#31](https://github.com/01protocol/zo-client/pull/31))

## [0.2.3] - 2022-01-01 🥳

- Changed serum-ts to lite-serum to remove unnecessary files ([#29](https://github.com/01protocol/zo-client/pull/29))

## [0.2.0] - 2021-12-25 🎅

### Added

- Deposit/Withdraw: Now accepts a mint pubkey and deposits/withdraws directly to/from an associated token account
- Deposit/Withdraw: Old implementations of deposit/withdraw are repurposed as depositRaw/withdrawRaw in case users want
  to deposit/withdraw to/from a specific account
- Withdraw: Associated token account is created before withdrawal if such account does not exist
- Margin: Add an optional limit arg to placePerpOrder used when compute limit is reached
- Margin: ClientId can now be passed as an input to placePerpOrder to tag specific orders with a unique id, that can be
  used to cancel the order using the clientId
- Margin: New instruction cancelPerpOrderByClientId that cancels using the pre-assigned unique client id

### Changed

- Margin: Swap method is now simplified. Takes in big units (like SOL and BTC) instead of smol units (like satoshis and
  lamports).
- Margin: Swap method now accepts a slippage parameter.
- Margin: PlacePerpOrder is now simplified. Takes in big units. No longer takes in maxQuoteQty.

## [0.1.0] - 2021-12-16

### Added

- Life to this repo
