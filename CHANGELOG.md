# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2021-12-25 🎅

### Added
- Withdraw & deposit now accept mint and deposit/withdraw directly to/from associated token account
- Associated token account is created before withdrawal if such account does not exist
- Old implementations of deposit / withdrawals are repurposed as depositRaw/ withdrawRaw in case users want to deposit/withdraw to/from a specific account
- Add a limit arg to placePerpOrder used when compute limit is reached
- ClientId as an input to placePerpOrder to tag specific orders with a unique id, that can be used to specifically cancel
- New instruction cancelPerpOrderByClientId that cancels using the pre-assigned unique client id

### Changed 
- Swap is now simplified. Takes in big units (like SOL and BTC) instead of smol units (like satoshis and lamports). Accepts a slippage parameter. 
- PlacePerpOrder is now simplified. Takes in big units. No longer takes in maxQuoteQty.

## [0.1.0] - 2021-12-16

### Added

- Life to this repo
