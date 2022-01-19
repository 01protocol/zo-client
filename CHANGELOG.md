# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Margin: Added reduceOnlyIoc and reduceOnlyLimit order types ([#49](https://github.com/01protocol/zo-client/pull/49))

## [0.2.7] - 2022-1-16

- General: updated anchor to newer version and enabled commitment passing ([#42](https://github.com/01protocol/zo-client/pull/42))
- Fix: fixed decimal errors on some decoding ([#42](https://github.com/01protocol/zo-client/pull/42))

## [0.2.6] - 2022-1-4 

- Events: Added swap event ([#32](https://github.com/01protocol/zo-client/pull/32))
- Fix: Npm build ([#33](https://github.com/01protocol/zo-client/pull/38))

## [0.2.4] - 2022-1-1 🥳

- Events: Added anchor events and decoder ([#31](https://github.com/01protocol/zo-client/pull/31))


## [0.2.3] - 2022-1-1 🥳

- Changed serum-ts to lite-serum to remove unnecessary files ([#29](https://github.com/01protocol/zo-client/pull/29))


## [0.2.0] - 2021-12-25 🎅

### Added
- Deposit/Withdraw: Now accepts a mint pubkey and deposits/withdraws directly to/from an associated token account
- Deposit/Withdraw: Old implementations of deposit/withdraw are repurposed as depositRaw/withdrawRaw in case users want to deposit/withdraw to/from a specific account
- Withdraw: Associated token account is created before withdrawal if such account does not exist
- Margin: Add an optional limit arg to placePerpOrder used when compute limit is reached
- Margin: ClientId can now be passed as an input to placePerpOrder to tag specific orders with a unique id, that can be used to cancel the order using the clientId
- Margin: New instruction cancelPerpOrderByClientId that cancels using the pre-assigned unique client id

### Changed 
- Margin: Swap method is now simplified. Takes in big units (like SOL and BTC) instead of smol units (like satoshis and lamports).
- Margin: Swap method now accepts a slippage parameter.
- Margin: PlacePerpOrder is now simplified. Takes in big units. No longer takes in maxQuoteQty.

## [0.1.0] - 2021-12-16

### Added

- Life to this repo
