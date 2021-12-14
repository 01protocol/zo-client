export type Zo = {
  "version": "0.1.0",
  "name": "zo",
  "instructions": [
    {
      "name": "initState",
      "accounts": [
        {
          "name": "admin",
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
          "name": "swapFeeVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
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
          "name": "signerNonce",
          "type": "u8"
        }
      ]
    },
    {
      "name": "changeAdmin",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newAdmin",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addInsurance",
      "accounts": [
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
          "name": "authority",
          "isMut": false,
          "isSigner": true
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "reduceInsurance",
      "accounts": [
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
          "name": "admin",
          "isMut": false,
          "isSigner": true
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sweepMarketFees",
      "accounts": [
        {
          "name": "admin",
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
          "name": "treasuryTokenAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "srmTokenAcc",
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
      "args": []
    },
    {
      "name": "addCollateral",
      "accounts": [
        {
          "name": "admin",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "oracleSymbol",
          "type": "string"
        },
        {
          "name": "weight",
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
          "name": "liqFee",
          "type": "u16"
        },
        {
          "name": "ogFee",
          "type": "u16"
        }
      ]
    },
    {
      "name": "updateCollateral",
      "accounts": [
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newWeight",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "newOracleSymbol",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "addOracle",
      "accounts": [
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
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
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "baseDecimals",
          "type": "u8"
        },
        {
          "name": "quoteDecimals",
          "type": "u8"
        },
        {
          "name": "oracleTypes",
          "type": {
            "vec": {
              "defined": "OracleType"
            }
          }
        }
      ]
    },
    {
      "name": "removeOracle",
      "accounts": [
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
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
          "name": "symbol",
          "type": "string"
        }
      ]
    },
    {
      "name": "sweepAccruedFees",
      "accounts": [
        {
          "name": "admin",
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
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAcc",
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
      "args": []
    },
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
      "name": "initPerpMarket",
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
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cache",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "asks",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "oracleSymbol",
          "type": "string"
        },
        {
          "name": "perpType",
          "type": {
            "defined": "PerpType"
          }
        },
        {
          "name": "vAssetLotSize",
          "type": "u64"
        },
        {
          "name": "vCollateralLotSize",
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
          "name": "coinDecimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updatePerpMarketInfo",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newBaseImf",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "newOracleSymbol",
          "type": {
            "option": "string"
          }
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
      "name": "forceCloseEverlastingPosition",
      "accounts": [
        {
          "name": "liquidator",
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
      "args": []
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
      "name": "enableSwap",
      "accounts": [
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
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "serumOpenOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSpotProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSwapProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "disableSwap",
      "accounts": [
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
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "serumOpenOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSpotProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSwapProgram",
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
          "name": "srmSwapProgram",
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
      "name": "sweepSwapFees",
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
          "name": "quoteVault",
          "isMut": true,
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
        }
      ],
      "args": []
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
        },
        {
          "name": "coinFeeReceivableAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pcFeeReceivableAccount",
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
                100
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
                100
              ]
            }
          },
          {
            "name": "fundingCache",
            "type": {
              "array": [
                "i128",
                100
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
                50
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
                100
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
                50
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
                50
              ]
            }
          },
          {
            "name": "vaults",
            "type": {
              "array": [
                "publicKey",
                50
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
                50
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
                100
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
              "array": [
                {
                  "defined": "Olhc"
                },
                12
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Olhc",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "open",
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
            "name": "high",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "close",
            "type": {
              "defined": "WrappedI80F48"
            }
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
      "name": "OracleNotRecentlyUpdated",
      "msg": "Oracle has not been recently updated"
    }
  ]
};

export const IDL: Zo = {
  "version": "0.1.0",
  "name": "zo",
  "instructions": [
    {
      "name": "initState",
      "accounts": [
        {
          "name": "admin",
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
          "name": "swapFeeVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cache",
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
          "name": "signerNonce",
          "type": "u8"
        }
      ]
    },
    {
      "name": "changeAdmin",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newAdmin",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addInsurance",
      "accounts": [
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
          "name": "authority",
          "isMut": false,
          "isSigner": true
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "reduceInsurance",
      "accounts": [
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
          "name": "admin",
          "isMut": false,
          "isSigner": true
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "sweepMarketFees",
      "accounts": [
        {
          "name": "admin",
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
          "name": "treasuryTokenAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "srmTokenAcc",
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
      "args": []
    },
    {
      "name": "addCollateral",
      "accounts": [
        {
          "name": "admin",
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
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "oracleSymbol",
          "type": "string"
        },
        {
          "name": "weight",
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
          "name": "liqFee",
          "type": "u16"
        },
        {
          "name": "ogFee",
          "type": "u16"
        }
      ]
    },
    {
      "name": "updateCollateral",
      "accounts": [
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newWeight",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "newOracleSymbol",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "addOracle",
      "accounts": [
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
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
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "baseDecimals",
          "type": "u8"
        },
        {
          "name": "quoteDecimals",
          "type": "u8"
        },
        {
          "name": "oracleTypes",
          "type": {
            "vec": {
              "defined": "OracleType"
            }
          }
        }
      ]
    },
    {
      "name": "removeOracle",
      "accounts": [
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
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
          "name": "symbol",
          "type": "string"
        }
      ]
    },
    {
      "name": "sweepAccruedFees",
      "accounts": [
        {
          "name": "admin",
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
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryTokenAcc",
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
      "args": []
    },
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
      "name": "initPerpMarket",
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
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "cache",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "bids",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "asks",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "oracleSymbol",
          "type": "string"
        },
        {
          "name": "perpType",
          "type": {
            "defined": "PerpType"
          }
        },
        {
          "name": "vAssetLotSize",
          "type": "u64"
        },
        {
          "name": "vCollateralLotSize",
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
          "name": "coinDecimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updatePerpMarketInfo",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cache",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newBaseImf",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "newOracleSymbol",
          "type": {
            "option": "string"
          }
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
      "name": "forceCloseEverlastingPosition",
      "accounts": [
        {
          "name": "liquidator",
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
      "args": []
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
      "name": "enableSwap",
      "accounts": [
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
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "serumOpenOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSpotProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSwapProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "disableSwap",
      "accounts": [
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
          "name": "admin",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "serumOpenOrders",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "serumMarket",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSpotProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "srmSwapProgram",
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
          "name": "srmSwapProgram",
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
      "name": "sweepSwapFees",
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
          "name": "quoteVault",
          "isMut": true,
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
        }
      ],
      "args": []
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
        },
        {
          "name": "coinFeeReceivableAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "pcFeeReceivableAccount",
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
                100
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
                100
              ]
            }
          },
          {
            "name": "fundingCache",
            "type": {
              "array": [
                "i128",
                100
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
                50
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
                100
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
                50
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
                50
              ]
            }
          },
          {
            "name": "vaults",
            "type": {
              "array": [
                "publicKey",
                50
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
                50
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
                100
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
              "array": [
                {
                  "defined": "Olhc"
                },
                12
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Olhc",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startTime",
            "type": "u64"
          },
          {
            "name": "open",
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
            "name": "high",
            "type": {
              "defined": "WrappedI80F48"
            }
          },
          {
            "name": "close",
            "type": {
              "defined": "WrappedI80F48"
            }
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
      "name": "OracleNotRecentlyUpdated",
      "msg": "Oracle has not been recently updated"
    }
  ]
};