export type Zo = {
  "version": "0.1.0",
  "name": "zo",
  "constants": [
    {
      "name": "SPOT_INITIAL_MARGIN_REQ",
      "type": "u64",
      "value": "1_100_000"
    },
    {
      "name": "SPOT_MAINT_MARGIN_REQ",
      "type": "u64",
      "value": "1_030_000"
    },
    {
      "name": "DUST_THRESHOLD",
      "type": "i64",
      "value": "10_000"
    },
    {
      "name": "ORACLE_STALENESS_THRESH",
      "type": "u64",
      "value": "5"
    },
    {
      "name": "TWAP_SAMPLE_DT",
      "type": "u64",
      "value": "300"
    },
    {
      "name": "TWAP_SAMPLES_PER_H",
      "type": "u64",
      "value": "12"
    },
    {
      "name": "DEFAULT_IR_MULTIPLIER",
      "type": "u64",
      "value": "1_000_000"
    },
    {
      "name": "VALID_DT",
      "type": "u64",
      "value": "20"
    },
    {
      "name": "MAX_COLLATERALS",
      "type": "u64",
      "value": "25"
    },
    {
      "name": "MAX_MARKETS",
      "type": "u64",
      "value": "50"
    },
    {
      "name": "DEBUG_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"DEBUG\""
    },
    {
      "name": "NOOPS_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"NOOPS\""
    },
    {
      "name": "LIQ_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"LIQ\""
    },
    {
      "name": "BANKRUPTCY_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"BANK\""
    },
    {
      "name": "BORROW_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"BOR\""
    }
  ],
  "instructions": [
    {
      "name": "createMargin",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u8"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "repayOnly",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "allowBorrow",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createPerpOpenOrders",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "openOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "placePerpOrder",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "openOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reqQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "isLong",
          "type": "bool"
        },
        {
          "name": "limitPrice",
          "type": "u64"
        },
        {
          "name": "maxBaseQuantity",
          "type": "u64"
        },
        {
          "name": "maxQuoteQuantity",
          "type": "u64"
        },
        {
          "name": "orderType",
          "type": {
            "defined": "OrderType"
          }
        },
        {
          "name": "limit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "cancelPerpOrder",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "openOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderId",
          "type": "u128"
        },
        {
          "name": "isLong",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updatePerpFunding",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "settleFunds",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "openOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "forceCancelAllPerpOrders",
      "accounts": [
        {
          "name": "pruner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reqQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "limit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "liquidatePerpPosition",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "liqorMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqorControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqorOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqee",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "liqeeMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reqQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "assetTransferLots",
          "type": "u64"
        }
      ]
    },
    {
      "name": "liquidateSpotPosition",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "liqorMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqorControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "assetMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "assetTransferAmount",
          "type": "i64"
        }
      ]
    },
    {
      "name": "settleBankruptcy",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "liqorMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqorControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "assetMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "swap",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "assetMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "assetVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapFeeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumOpenOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumRequestQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumEventQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumCoinVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumPcVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumVaultSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSpotProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buy",
          "type": "bool"
        },
        {
          "name": "allowBorrow",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "minRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cacheOracle",
      "accounts": [
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "symbols",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "mockPrices",
          "type": {
            "option": {
              "vec": {
                "option": "u64"
              }
            }
          }
        }
      ]
    },
    {
      "name": "cacheInterestRates",
      "accounts": [
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "start",
          "type": "u8"
        },
        {
          "name": "end",
          "type": "u8"
        }
      ]
    },
    {
      "name": "consumeEvents",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQueue",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "limit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "crankPnl",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "cache",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oracles",
            "type": {
              "array": [
                {
                  "defined": "OracleCache"
                },
                25
              ]
            }
          },
          {
            "name": "marks",
            "type": {
              "array": [
                {
                  "defined": "MarkCache"
                },
                50
              ]
            }
          },
          {
            "name": "fundingCache",
            "type": {
              "array": [
                "i128",
                50
              ]
            }
          },
          {
            "name": "borrowCache",
            "type": {
              "array": [
                {
                  "defined": "BorrowCache"
                },
                25
              ]
            }
          }
        ]
      }
    },
    {
      "name": "control",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "openOrdersAgg",
            "type": {
              "array": [
                {
                  "defined": "OpenOrdersInfo"
                },
                50
              ]
            }
          }
        ]
      }
    },
    {
      "name": "margin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "collateral",
            "type": {
              "array": [
                {
                  "defined": "WrappedI80F48"
                },
                25
              ]
            }
          },
          {
            "name": "control",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signerNonce",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "cache",
            "type": "publicKey"
          },
          {
            "name": "swapFeeVault",
            "type": "publicKey"
          },
          {
            "name": "insurance",
            "type": "u64"
          },
          {
            "name": "feesAccrued",
            "type": {
              "array": [
                "u64",
                25
              ]
            }
          },
          {
            "name": "vaults",
            "type": {
              "array": [
                "publicKey",
                25
              ]
            }
          },
          {
            "name": "collaterals",
            "type": {
              "array": [
                {
                  "defined": "CollateralInfo"
                },
                25
              ]
            }
          },
          {
            "name": "perpMarkets",
            "type": {
              "array": [
                {
                  "defined": "PerpMarketInfo"
                },
                50
              ]
            }
          },
          {
            "name": "totalCollaterals",
            "type": "u16"
          },
          {
            "name": "totalMarkets",
            "type": "u16"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "BorrowCache",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "supply",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "borrows",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "supplyMultiplier",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "borrowMultiplier",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "lastUpdated",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OracleCache",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "symbol",
            "type": {
              "defined": "Symbol"
            }
          },
          {
            "name": "sources",
            "type": {
              "array": [
                {
                  "defined": "OracleSource"
                },
                2
              ]
            }
          },
          {
            "name": "lastUpdated",
            "type": "u64"
          },
          {
            "name": "price",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "twap",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "baseDecimals",
            "type": "u8"
          },
          {
            "name": "quoteDecimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "MarkCache",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "twap",
            "type": {
              "defined": "TwapInfo"
            }
          }
        ]
      }
    },
    {
      "name": "TwapInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cumulAvg",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "open",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "high",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "low",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "close",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "lastSampleStartTime",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OpenOrdersInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "nativePcTotal",
            "type": "i64"
          },
          {
            "name": "posSize",
            "type": "i64"
          },
          {
            "name": "realizedPnl",
            "type": "i64"
          },
          {
            "name": "coinOnBids",
            "type": "u64"
          },
          {
            "name": "coinOnAsks",
            "type": "u64"
          },
          {
            "name": "orderCount",
            "type": "u8"
          },
          {
            "name": "fundingIndex",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "OracleSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ty",
            "type": {
              "defined": "OracleType"
            }
          },
          {
            "name": "key",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "OraclePrice",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "twap",
            "type": {
              "defined": "WrappedI80F48"
            }
          }
        ]
      }
    },
    {
      "name": "CollateralInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "oracleSymbol",
            "type": {
              "defined": "Symbol"
            }
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "weight",
            "type": "u16"
          },
          {
            "name": "liqFee",
            "type": "u16"
          },
          {
            "name": "isBorrowable",
            "type": "bool"
          },
          {
            "name": "optimalUtil",
            "type": "u16"
          },
          {
            "name": "optimalRate",
            "type": "u16"
          },
          {
            "name": "maxRate",
            "type": "u16"
          },
          {
            "name": "ogFee",
            "type": "u16"
          },
          {
            "name": "isSwappable",
            "type": "bool"
          },
          {
            "name": "serumOpenOrders",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "PerpMarketInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "symbol",
            "type": {
              "defined": "Symbol"
            }
          },
          {
            "name": "oracleSymbol",
            "type": {
              "defined": "Symbol"
            }
          },
          {
            "name": "perpType",
            "type": {
              "defined": "PerpType"
            }
          },
          {
            "name": "assetDecimals",
            "type": "u8"
          },
          {
            "name": "assetLotSize",
            "type": "u64"
          },
          {
            "name": "quoteLotSize",
            "type": "u64"
          },
          {
            "name": "strike",
            "type": "u64"
          },
          {
            "name": "baseImf",
            "type": "u16"
          },
          {
            "name": "liqFee",
            "type": "u16"
          },
          {
            "name": "dexMarket",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "Symbol",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                24
              ]
            }
          }
        ]
      }
    },
    {
      "name": "WrappedI80F48",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "OracleType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Nil"
          },
          {
            "name": "Pyth"
          },
          {
            "name": "Switchboard"
          }
        ]
      }
    },
    {
      "name": "FractionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Maintenance"
          },
          {
            "name": "Initial"
          },
          {
            "name": "Cancel"
          }
        ]
      }
    },
    {
      "name": "OrderType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Limit"
          },
          {
            "name": "ImmediateOrCancel"
          },
          {
            "name": "PostOnly"
          }
        ]
      }
    },
    {
      "name": "PerpType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Future"
          },
          {
            "name": "CallOption"
          },
          {
            "name": "PutOption"
          }
        ]
      }
    },
    {
      "name": "Side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Bid"
          },
          {
            "name": "Ask"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MathFailure",
      "msg": "A math failure occured, likely due to overflow"
    },
    {
      "code": 6001,
      "name": "InsufficientFunds",
      "msg": "The amount you are withdrawing exceeds the available collateral"
    },
    {
      "code": 6002,
      "name": "Unauthorized",
      "msg": "Unauthorized to perform the operation"
    },
    {
      "code": 6003,
      "name": "InvalidArgument",
      "msg": "Arguments passed were invalid"
    },
    {
      "code": 6004,
      "name": "InvalidMint",
      "msg": "Invalid mint for transaction"
    },
    {
      "code": 6005,
      "name": "InvalidOrderState",
      "msg": "Everlasting account state is invalid"
    },
    {
      "code": 6006,
      "name": "BelowMarginMaintenance",
      "msg": "Going below Margin maintenance"
    },
    {
      "code": 6007,
      "name": "AboveMMF",
      "msg": "Above Margin maintenance"
    },
    {
      "code": 6008,
      "name": "PositionValueCalculationFailure",
      "msg": "Couldn't calculate the position value"
    },
    {
      "code": 6009,
      "name": "InvalidPythAccount",
      "msg": "Pyth account is invalid"
    },
    {
      "code": 6010,
      "name": "IncompleteLiquidation",
      "msg": "Liquidation has not fully completed"
    },
    {
      "code": 6011,
      "name": "NotMarkedLiquidate",
      "msg": "The account has not been marked for liquidation"
    },
    {
      "code": 6012,
      "name": "UnderLiquidation",
      "msg": "Account is under liquidation"
    },
    {
      "code": 6013,
      "name": "LoadDexMarketFailure",
      "msg": "Failed to load dex market"
    },
    {
      "code": 6014,
      "name": "LoadOpenOrdersFailure",
      "msg": "Failed to load open orders"
    },
    {
      "code": 6015,
      "name": "CalculateMarginRatioFailure",
      "msg": "Failed to calculate margin ratio"
    },
    {
      "code": 6016,
      "name": "BelowInitialMarginFraction",
      "msg": "Current margin fraction is below position initial margin fraction"
    },
    {
      "code": 6017,
      "name": "NoPositionToLiquidate",
      "msg": "No active positions to close"
    },
    {
      "code": 6018,
      "name": "CollateralAlreadyExists",
      "msg": "The collateral pair already exists in the collateral array"
    },
    {
      "code": 6019,
      "name": "CollateralAtCapacity",
      "msg": "The collateral array is at full capacity"
    },
    {
      "code": 6020,
      "name": "CollateralDoesNotExist",
      "msg": "The collateral pair does not exist in the collateral array"
    },
    {
      "code": 6021,
      "name": "DexMarketKeyAlreadyExists",
      "msg": "The DEX Market key already exists in perp markets array"
    },
    {
      "code": 6022,
      "name": "SymbolAlreadyExists",
      "msg": "The symbol already exists in perp markets array"
    },
    {
      "code": 6023,
      "name": "MarketsAtCapacity",
      "msg": "The perp markets array is at full capacity"
    },
    {
      "code": 6024,
      "name": "InvalidVault",
      "msg": "The given vault does not match the state vault"
    },
    {
      "code": 6025,
      "name": "InvalidDexMarketKey",
      "msg": "The given DEX market key does not match any keys in the perp markets array"
    },
    {
      "code": 6026,
      "name": "OpenOrdersAlreadyInitialized",
      "msg": "The open orders account is already initialized"
    },
    {
      "code": 6027,
      "name": "InvalidLimitPrice",
      "msg": "The limit price is invalid"
    },
    {
      "code": 6028,
      "name": "InvalidMaxBaseQuantity",
      "msg": "The max base quantity is invalid"
    },
    {
      "code": 6029,
      "name": "InvalidMaxQuoteQuantity",
      "msg": "The max quote quantity is invalid"
    },
    {
      "code": 6030,
      "name": "OracleAlreadyExists",
      "msg": "The oracle already exists in the oracle cache"
    },
    {
      "code": 6031,
      "name": "OracleCacheFull",
      "msg": "Oracle cache is at full capacity"
    },
    {
      "code": 6032,
      "name": "OracleDoesNotExist",
      "msg": "The given oracle does not exist"
    },
    {
      "code": 6033,
      "name": "InvalidOracleKey",
      "msg": "The given oracle key is invalid"
    },
    {
      "code": 6034,
      "name": "InvalidOracleType",
      "msg": "The given oracle type is invalid"
    },
    {
      "code": 6035,
      "name": "PriceOracleIssue",
      "msg": "Oracle encountered an issue when fetching accurate price."
    },
    {
      "code": 6036,
      "name": "InvalidPythStatus",
      "msg": "Pyth oracle is not in trading status."
    },
    {
      "code": 6037,
      "name": "InvalidRemainingAccounts",
      "msg": "The remaining accounts passed are invalid"
    },
    {
      "code": 6038,
      "name": "DifferentExpo",
      "msg": "Expo is different"
    },
    {
      "code": 6039,
      "name": "InsufficientInsurance",
      "msg": "Insufficient funds in insurance"
    },
    {
      "code": 6040,
      "name": "InvalidOracle",
      "msg": "The oracle is invalid"
    },
    {
      "code": 6041,
      "name": "OracleNeedsUpdating",
      "msg": "Oracle last updated time is beyond the valid time since last update"
    },
    {
      "code": 6042,
      "name": "InvalidSymbol",
      "msg": "The symbol is invalid"
    },
    {
      "code": 6043,
      "name": "NegativeCollateral",
      "msg": "Negative collateral value"
    },
    {
      "code": 6044,
      "name": "NothingToRepay",
      "msg": "There is nothing to repay, cannot use repay only"
    },
    {
      "code": 6045,
      "name": "NothingToWithdraw",
      "msg": "There is nothing to repay, cannot use without allow borrow"
    },
    {
      "code": 6046,
      "name": "InsufficientWithdrawalLiquidity",
      "msg": "There is not enough liquidity in the vault to withdraw"
    },
    {
      "code": 6047,
      "name": "UncancelledOpenOrders",
      "msg": "There are open orders that have not been cancelled yet"
    },
    {
      "code": 6048,
      "name": "InvalidOpenOrdersKey",
      "msg": "Invalid open orders key"
    },
    {
      "code": 6049,
      "name": "NotBorrowable",
      "msg": "The asset is not borrowable"
    },
    {
      "code": 6050,
      "name": "InvalidOracleSymbol",
      "msg": "The oracle symbol is invalid"
    },
    {
      "code": 6051,
      "name": "UnliquidatedActivePositions",
      "msg": "There are active positions that have not been closed"
    },
    {
      "code": 6052,
      "name": "UnliquidatedSpotPositions",
      "msg": "There are spot/ borrow positions that have not been liquidated"
    },
    {
      "code": 6053,
      "name": "InvalidTimestamp",
      "msg": "Timestamp is invalid"
    },
    {
      "code": 6054,
      "name": "CollateralSwappable",
      "msg": "Collateral is already swappable"
    },
    {
      "code": 6055,
      "name": "CollateralNotSwappable",
      "msg": "Collateral is not swappable"
    },
    {
      "code": 6056,
      "name": "SwapNegative",
      "msg": "Swap did the opposite of what it should have"
    },
    {
      "code": 6057,
      "name": "SelfSwap",
      "msg": "Can't swap to and from the same collateral"
    },
    {
      "code": 6058,
      "name": "InsufficientSupply",
      "msg": "Insufficient supply"
    },
    {
      "code": 6059,
      "name": "OracleCacheStale",
      "msg": "Oracle has not been recently updated"
    },
    {
      "code": 6060,
      "name": "ZeroSwap",
      "msg": "No tokens received when swapping"
    },
    {
      "code": 6061,
      "name": "SlippageExceeded",
      "msg": "Slippage tolerance exceeded"
    }
  ]
};

export const IDL: Zo = {
  "version": "0.1.0",
  "name": "zo",
  "constants": [
    {
      "name": "SPOT_INITIAL_MARGIN_REQ",
      "type": "u64",
      "value": "1_100_000"
    },
    {
      "name": "SPOT_MAINT_MARGIN_REQ",
      "type": "u64",
      "value": "1_030_000"
    },
    {
      "name": "DUST_THRESHOLD",
      "type": "i64",
      "value": "10_000"
    },
    {
      "name": "ORACLE_STALENESS_THRESH",
      "type": "u64",
      "value": "5"
    },
    {
      "name": "TWAP_SAMPLE_DT",
      "type": "u64",
      "value": "300"
    },
    {
      "name": "TWAP_SAMPLES_PER_H",
      "type": "u64",
      "value": "12"
    },
    {
      "name": "DEFAULT_IR_MULTIPLIER",
      "type": "u64",
      "value": "1_000_000"
    },
    {
      "name": "VALID_DT",
      "type": "u64",
      "value": "20"
    },
    {
      "name": "MAX_COLLATERALS",
      "type": "u64",
      "value": "25"
    },
    {
      "name": "MAX_MARKETS",
      "type": "u64",
      "value": "50"
    },
    {
      "name": "DEBUG_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"DEBUG\""
    },
    {
      "name": "NOOPS_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"NOOPS\""
    },
    {
      "name": "LIQ_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"LIQ\""
    },
    {
      "name": "BANKRUPTCY_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"BANK\""
    },
    {
      "name": "BORROW_LOG",
      "type": {
        "defined": "&str"
      },
      "value": "\"BOR\""
    }
  ],
  "instructions": [
    {
      "name": "createMargin",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u8"
        }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "repayOnly",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "allowBorrow",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createPerpOpenOrders",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "openOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "placePerpOrder",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "openOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reqQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "isLong",
          "type": "bool"
        },
        {
          "name": "limitPrice",
          "type": "u64"
        },
        {
          "name": "maxBaseQuantity",
          "type": "u64"
        },
        {
          "name": "maxQuoteQuantity",
          "type": "u64"
        },
        {
          "name": "orderType",
          "type": {
            "defined": "OrderType"
          }
        },
        {
          "name": "limit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "cancelPerpOrder",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "openOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "orderId",
          "type": "u128"
        },
        {
          "name": "isLong",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updatePerpFunding",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "settleFunds",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "openOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "forceCancelAllPerpOrders",
      "accounts": [
        {
          "name": "pruner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reqQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "limit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "liquidatePerpPosition",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "liqorMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqorControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqorOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqee",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "liqeeMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reqQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "assetTransferLots",
          "type": "u64"
        }
      ]
    },
    {
      "name": "liquidateSpotPosition",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "liqorMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqorControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "assetMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "assetTransferAmount",
          "type": "i64"
        }
      ]
    },
    {
      "name": "settleBankruptcy",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqor",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "liqorMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqorControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "liqeeControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "assetMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "swap",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "margin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "control",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "assetMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "assetVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "swapFeeVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumOpenOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumRequestQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumEventQueue",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumBids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumAsks",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumCoinVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumPcVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumVaultSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSpotProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "buy",
          "type": "bool"
        },
        {
          "name": "allowBorrow",
          "type": "bool"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "minRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cacheOracle",
      "accounts": [
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "symbols",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "mockPrices",
          "type": {
            "option": {
              "vec": {
                "option": "u64"
              }
            }
          }
        }
      ]
    },
    {
      "name": "cacheInterestRates",
      "accounts": [
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "start",
          "type": "u8"
        },
        {
          "name": "end",
          "type": "u8"
        }
      ]
    },
    {
      "name": "consumeEvents",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQueue",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "limit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "crankPnl",
      "accounts": [
        {
          "name": "state",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "market",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "cache",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oracles",
            "type": {
              "array": [
                {
                  "defined": "OracleCache"
                },
                25
              ]
            }
          },
          {
            "name": "marks",
            "type": {
              "array": [
                {
                  "defined": "MarkCache"
                },
                50
              ]
            }
          },
          {
            "name": "fundingCache",
            "type": {
              "array": [
                "i128",
                50
              ]
            }
          },
          {
            "name": "borrowCache",
            "type": {
              "array": [
                {
                  "defined": "BorrowCache"
                },
                25
              ]
            }
          }
        ]
      }
    },
    {
      "name": "control",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "openOrdersAgg",
            "type": {
              "array": [
                {
                  "defined": "OpenOrdersInfo"
                },
                50
              ]
            }
          }
        ]
      }
    },
    {
      "name": "margin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "collateral",
            "type": {
              "array": [
                {
                  "defined": "WrappedI80F48"
                },
                25
              ]
            }
          },
          {
            "name": "control",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "state",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signerNonce",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "cache",
            "type": "publicKey"
          },
          {
            "name": "swapFeeVault",
            "type": "publicKey"
          },
          {
            "name": "insurance",
            "type": "u64"
          },
          {
            "name": "feesAccrued",
            "type": {
              "array": [
                "u64",
                25
              ]
            }
          },
          {
            "name": "vaults",
            "type": {
              "array": [
                "publicKey",
                25
              ]
            }
          },
          {
            "name": "collaterals",
            "type": {
              "array": [
                {
                  "defined": "CollateralInfo"
                },
                25
              ]
            }
          },
          {
            "name": "perpMarkets",
            "type": {
              "array": [
                {
                  "defined": "PerpMarketInfo"
                },
                50
              ]
            }
          },
          {
            "name": "totalCollaterals",
            "type": "u16"
          },
          {
            "name": "totalMarkets",
            "type": "u16"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "BorrowCache",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "supply",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "borrows",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "supplyMultiplier",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "borrowMultiplier",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "lastUpdated",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OracleCache",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "symbol",
            "type": {
              "defined": "Symbol"
            }
          },
          {
            "name": "sources",
            "type": {
              "array": [
                {
                  "defined": "OracleSource"
                },
                2
              ]
            }
          },
          {
            "name": "lastUpdated",
            "type": "u64"
          },
          {
            "name": "price",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "twap",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "baseDecimals",
            "type": "u8"
          },
          {
            "name": "quoteDecimals",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "MarkCache",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "twap",
            "type": {
              "defined": "TwapInfo"
            }
          }
        ]
      }
    },
    {
      "name": "TwapInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cumulAvg",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "open",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "high",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "low",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "close",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "lastSampleStartTime",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OpenOrdersInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "nativePcTotal",
            "type": "i64"
          },
          {
            "name": "posSize",
            "type": "i64"
          },
          {
            "name": "realizedPnl",
            "type": "i64"
          },
          {
            "name": "coinOnBids",
            "type": "u64"
          },
          {
            "name": "coinOnAsks",
            "type": "u64"
          },
          {
            "name": "orderCount",
            "type": "u8"
          },
          {
            "name": "fundingIndex",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "OracleSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ty",
            "type": {
              "defined": "OracleType"
            }
          },
          {
            "name": "key",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "OraclePrice",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "twap",
            "type": {
              "defined": "WrappedI80F48"
            }
          }
        ]
      }
    },
    {
      "name": "CollateralInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "oracleSymbol",
            "type": {
              "defined": "Symbol"
            }
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "weight",
            "type": "u16"
          },
          {
            "name": "liqFee",
            "type": "u16"
          },
          {
            "name": "isBorrowable",
            "type": "bool"
          },
          {
            "name": "optimalUtil",
            "type": "u16"
          },
          {
            "name": "optimalRate",
            "type": "u16"
          },
          {
            "name": "maxRate",
            "type": "u16"
          },
          {
            "name": "ogFee",
            "type": "u16"
          },
          {
            "name": "isSwappable",
            "type": "bool"
          },
          {
            "name": "serumOpenOrders",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "PerpMarketInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "symbol",
            "type": {
              "defined": "Symbol"
            }
          },
          {
            "name": "oracleSymbol",
            "type": {
              "defined": "Symbol"
            }
          },
          {
            "name": "perpType",
            "type": {
              "defined": "PerpType"
            }
          },
          {
            "name": "assetDecimals",
            "type": "u8"
          },
          {
            "name": "assetLotSize",
            "type": "u64"
          },
          {
            "name": "quoteLotSize",
            "type": "u64"
          },
          {
            "name": "strike",
            "type": "u64"
          },
          {
            "name": "baseImf",
            "type": "u16"
          },
          {
            "name": "liqFee",
            "type": "u16"
          },
          {
            "name": "dexMarket",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "Symbol",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": {
              "array": [
                "u8",
                24
              ]
            }
          }
        ]
      }
    },
    {
      "name": "WrappedI80F48",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "OracleType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Nil"
          },
          {
            "name": "Pyth"
          },
          {
            "name": "Switchboard"
          }
        ]
      }
    },
    {
      "name": "FractionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Maintenance"
          },
          {
            "name": "Initial"
          },
          {
            "name": "Cancel"
          }
        ]
      }
    },
    {
      "name": "OrderType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Limit"
          },
          {
            "name": "ImmediateOrCancel"
          },
          {
            "name": "PostOnly"
          }
        ]
      }
    },
    {
      "name": "PerpType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Future"
          },
          {
            "name": "CallOption"
          },
          {
            "name": "PutOption"
          }
        ]
      }
    },
    {
      "name": "Side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Bid"
          },
          {
            "name": "Ask"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "MathFailure",
      "msg": "A math failure occured, likely due to overflow"
    },
    {
      "code": 6001,
      "name": "InsufficientFunds",
      "msg": "The amount you are withdrawing exceeds the available collateral"
    },
    {
      "code": 6002,
      "name": "Unauthorized",
      "msg": "Unauthorized to perform the operation"
    },
    {
      "code": 6003,
      "name": "InvalidArgument",
      "msg": "Arguments passed were invalid"
    },
    {
      "code": 6004,
      "name": "InvalidMint",
      "msg": "Invalid mint for transaction"
    },
    {
      "code": 6005,
      "name": "InvalidOrderState",
      "msg": "Everlasting account state is invalid"
    },
    {
      "code": 6006,
      "name": "BelowMarginMaintenance",
      "msg": "Going below Margin maintenance"
    },
    {
      "code": 6007,
      "name": "AboveMMF",
      "msg": "Above Margin maintenance"
    },
    {
      "code": 6008,
      "name": "PositionValueCalculationFailure",
      "msg": "Couldn't calculate the position value"
    },
    {
      "code": 6009,
      "name": "InvalidPythAccount",
      "msg": "Pyth account is invalid"
    },
    {
      "code": 6010,
      "name": "IncompleteLiquidation",
      "msg": "Liquidation has not fully completed"
    },
    {
      "code": 6011,
      "name": "NotMarkedLiquidate",
      "msg": "The account has not been marked for liquidation"
    },
    {
      "code": 6012,
      "name": "UnderLiquidation",
      "msg": "Account is under liquidation"
    },
    {
      "code": 6013,
      "name": "LoadDexMarketFailure",
      "msg": "Failed to load dex market"
    },
    {
      "code": 6014,
      "name": "LoadOpenOrdersFailure",
      "msg": "Failed to load open orders"
    },
    {
      "code": 6015,
      "name": "CalculateMarginRatioFailure",
      "msg": "Failed to calculate margin ratio"
    },
    {
      "code": 6016,
      "name": "BelowInitialMarginFraction",
      "msg": "Current margin fraction is below position initial margin fraction"
    },
    {
      "code": 6017,
      "name": "NoPositionToLiquidate",
      "msg": "No active positions to close"
    },
    {
      "code": 6018,
      "name": "CollateralAlreadyExists",
      "msg": "The collateral pair already exists in the collateral array"
    },
    {
      "code": 6019,
      "name": "CollateralAtCapacity",
      "msg": "The collateral array is at full capacity"
    },
    {
      "code": 6020,
      "name": "CollateralDoesNotExist",
      "msg": "The collateral pair does not exist in the collateral array"
    },
    {
      "code": 6021,
      "name": "DexMarketKeyAlreadyExists",
      "msg": "The DEX Market key already exists in perp markets array"
    },
    {
      "code": 6022,
      "name": "SymbolAlreadyExists",
      "msg": "The symbol already exists in perp markets array"
    },
    {
      "code": 6023,
      "name": "MarketsAtCapacity",
      "msg": "The perp markets array is at full capacity"
    },
    {
      "code": 6024,
      "name": "InvalidVault",
      "msg": "The given vault does not match the state vault"
    },
    {
      "code": 6025,
      "name": "InvalidDexMarketKey",
      "msg": "The given DEX market key does not match any keys in the perp markets array"
    },
    {
      "code": 6026,
      "name": "OpenOrdersAlreadyInitialized",
      "msg": "The open orders account is already initialized"
    },
    {
      "code": 6027,
      "name": "InvalidLimitPrice",
      "msg": "The limit price is invalid"
    },
    {
      "code": 6028,
      "name": "InvalidMaxBaseQuantity",
      "msg": "The max base quantity is invalid"
    },
    {
      "code": 6029,
      "name": "InvalidMaxQuoteQuantity",
      "msg": "The max quote quantity is invalid"
    },
    {
      "code": 6030,
      "name": "OracleAlreadyExists",
      "msg": "The oracle already exists in the oracle cache"
    },
    {
      "code": 6031,
      "name": "OracleCacheFull",
      "msg": "Oracle cache is at full capacity"
    },
    {
      "code": 6032,
      "name": "OracleDoesNotExist",
      "msg": "The given oracle does not exist"
    },
    {
      "code": 6033,
      "name": "InvalidOracleKey",
      "msg": "The given oracle key is invalid"
    },
    {
      "code": 6034,
      "name": "InvalidOracleType",
      "msg": "The given oracle type is invalid"
    },
    {
      "code": 6035,
      "name": "PriceOracleIssue",
      "msg": "Oracle encountered an issue when fetching accurate price."
    },
    {
      "code": 6036,
      "name": "InvalidPythStatus",
      "msg": "Pyth oracle is not in trading status."
    },
    {
      "code": 6037,
      "name": "InvalidRemainingAccounts",
      "msg": "The remaining accounts passed are invalid"
    },
    {
      "code": 6038,
      "name": "DifferentExpo",
      "msg": "Expo is different"
    },
    {
      "code": 6039,
      "name": "InsufficientInsurance",
      "msg": "Insufficient funds in insurance"
    },
    {
      "code": 6040,
      "name": "InvalidOracle",
      "msg": "The oracle is invalid"
    },
    {
      "code": 6041,
      "name": "OracleNeedsUpdating",
      "msg": "Oracle last updated time is beyond the valid time since last update"
    },
    {
      "code": 6042,
      "name": "InvalidSymbol",
      "msg": "The symbol is invalid"
    },
    {
      "code": 6043,
      "name": "NegativeCollateral",
      "msg": "Negative collateral value"
    },
    {
      "code": 6044,
      "name": "NothingToRepay",
      "msg": "There is nothing to repay, cannot use repay only"
    },
    {
      "code": 6045,
      "name": "NothingToWithdraw",
      "msg": "There is nothing to repay, cannot use without allow borrow"
    },
    {
      "code": 6046,
      "name": "InsufficientWithdrawalLiquidity",
      "msg": "There is not enough liquidity in the vault to withdraw"
    },
    {
      "code": 6047,
      "name": "UncancelledOpenOrders",
      "msg": "There are open orders that have not been cancelled yet"
    },
    {
      "code": 6048,
      "name": "InvalidOpenOrdersKey",
      "msg": "Invalid open orders key"
    },
    {
      "code": 6049,
      "name": "NotBorrowable",
      "msg": "The asset is not borrowable"
    },
    {
      "code": 6050,
      "name": "InvalidOracleSymbol",
      "msg": "The oracle symbol is invalid"
    },
    {
      "code": 6051,
      "name": "UnliquidatedActivePositions",
      "msg": "There are active positions that have not been closed"
    },
    {
      "code": 6052,
      "name": "UnliquidatedSpotPositions",
      "msg": "There are spot/ borrow positions that have not been liquidated"
    },
    {
      "code": 6053,
      "name": "InvalidTimestamp",
      "msg": "Timestamp is invalid"
    },
    {
      "code": 6054,
      "name": "CollateralSwappable",
      "msg": "Collateral is already swappable"
    },
    {
      "code": 6055,
      "name": "CollateralNotSwappable",
      "msg": "Collateral is not swappable"
    },
    {
      "code": 6056,
      "name": "SwapNegative",
      "msg": "Swap did the opposite of what it should have"
    },
    {
      "code": 6057,
      "name": "SelfSwap",
      "msg": "Can't swap to and from the same collateral"
    },
    {
      "code": 6058,
      "name": "InsufficientSupply",
      "msg": "Insufficient supply"
    },
    {
      "code": 6059,
      "name": "OracleCacheStale",
      "msg": "Oracle has not been recently updated"
    },
    {
      "code": 6060,
      "name": "ZeroSwap",
      "msg": "No tokens received when swapping"
    },
    {
      "code": 6061,
      "name": "SlippageExceeded",
      "msg": "Slippage tolerance exceeded"
    }
  ]
};
