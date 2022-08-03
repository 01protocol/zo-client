export type ZammIdlType = {
  "version": "0.1.0",
  "name": "zamm",
  "instructions": [
    {
      "name": "initState",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
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
          "name": "stateNonce",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initZamm",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "zammNonce",
          "type": "u8"
        },
        {
          "name": "zoMarginNonce",
          "type": "u8"
        },
        {
          "name": "rate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pauseUnpause",
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
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateZamm",
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
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initStakerInfo",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zamm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "margin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dexMarket",
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
      "name": "stake",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "authXTokenAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authYTokenAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoXVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoYVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "limit",
          "type": "u16"
        },
        {
          "name": "p",
          "type": "u64"
        },
        {
          "name": "startY",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "xMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authOo",
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
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "limit",
          "type": "u16"
        },
        {
          "name": "p",
          "type": "u64"
        }
      ]
    },
    {
      "name": "rebalance",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
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
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
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
      "name": "redeemRewards",
      "accounts": [
        {
          "name": "state",
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
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zamm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "arbZamm",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "xMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authOo",
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "dx",
          "type": "i64"
        },
        {
          "name": "limitDy",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelAllOrders",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketKey",
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
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
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
          "name": "limit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "placeOrders",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketKey",
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
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
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
    }
  ],
  "accounts": [
    {
      "name": "StakerInfo",
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
            "name": "margin",
            "type": "publicKey"
          },
          {
            "name": "dexMarket",
            "type": "publicKey"
          },
          {
            "name": "lp",
            "type": "u64"
          },
          {
            "name": "xDeposit",
            "type": "u64"
          },
          {
            "name": "rewardEntryTime",
            "type": "u64"
          },
          {
            "name": "lastRewardIndex",
            "type": {
              "defined": "ZammI80F48"
            }
          },
          {
            "name": "readyToWithdraw",
            "type": {
              "defined": "ZammI80F48"
            }
          }
        ]
      }
    },
    {
      "name": "State",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "zamm",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": "u8"
          },
          {
            "name": "marketKey",
            "type": "publicKey"
          },
          {
            "name": "x",
            "type": "u64"
          },
          {
            "name": "totalLp",
            "type": "u64"
          },
          {
            "name": "marginKey",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "ZammStatus"
            }
          },
          {
            "name": "rewardRate",
            "type": "u64"
          },
          {
            "name": "rateLastUpdated",
            "type": "u64"
          },
          {
            "name": "rewardIndex",
            "type": {
              "defined": "ZammI80F48"
            }
          },
          {
            "name": "rewardVault",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ZammI80F48",
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
      "name": "ZammStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "OrdersCancelled"
          },
          {
            "name": "IOrdersPlaced"
          },
          {
            "name": "IIOrdersPlaced"
          },
          {
            "name": "IIIOrdersPlaced"
          },
          {
            "name": "IVOrdersPlaced"
          },
          {
            "name": "VOrdersPlaced"
          },
          {
            "name": "Paused"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidArgument",
      "msg": "At"
    },
    {
      "code": 6001,
      "name": "InvalidZammStatus",
      "msg": "Zamm"
    },
    {
      "code": 6002,
      "name": "UncancelledOrders",
      "msg": "Some"
    },
    {
      "code": 6003,
      "name": "InvalidZoState",
      "msg": "Invalid"
    },
    {
      "code": 6004,
      "name": "InvalidTokenAccount",
      "msg": "Invalid"
    },
    {
      "code": 6005,
      "name": "SlippageExceeded",
      "msg": "Slippage"
    },
    {
      "code": 6006,
      "name": "InvalidEventQueue",
      "msg": "Event"
    },
    {
      "code": 6007,
      "name": "EventQueueNotCleared",
      "msg": "Zamm"
    }
  ]
}

export const ZAMM_IDL: ZammIdlType ={
  "version": "0.1.0",
  "name": "zamm",
  "instructions": [
    {
      "name": "initState",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "state",
          "isMut": true,
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
          "name": "stateNonce",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initZamm",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketKey",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "zammNonce",
          "type": "u8"
        },
        {
          "name": "zoMarginNonce",
          "type": "u8"
        },
        {
          "name": "rate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pauseUnpause",
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
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateZamm",
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
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initStakerInfo",
      "accounts": [
        {
          "name": "state",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zamm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "margin",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "dexMarket",
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
      "name": "stake",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "authXTokenAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authYTokenAcc",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoXVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoYVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "dexMarket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "eventQ",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "limit",
          "type": "u16"
        },
        {
          "name": "p",
          "type": "u64"
        },
        {
          "name": "startY",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "xMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authOo",
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
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "limit",
          "type": "u16"
        },
        {
          "name": "p",
          "type": "u64"
        }
      ]
    },
    {
      "name": "rebalance",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
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
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
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
      "name": "redeemRewards",
      "accounts": [
        {
          "name": "state",
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
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zamm",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "arbZamm",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "xMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authOo",
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
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "dx",
          "type": "i64"
        },
        {
          "name": "limitDy",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelAllOrders",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketKey",
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
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
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
          "name": "limit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "placeOrders",
      "accounts": [
        {
          "name": "payer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "zamm",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoState",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoCache",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammControl",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zammOo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketKey",
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
          "name": "zoProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoDexProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
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
    }
  ],
  "accounts": [
    {
      "name": "StakerInfo",
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
            "name": "margin",
            "type": "publicKey"
          },
          {
            "name": "dexMarket",
            "type": "publicKey"
          },
          {
            "name": "lp",
            "type": "u64"
          },
          {
            "name": "xDeposit",
            "type": "u64"
          },
          {
            "name": "rewardEntryTime",
            "type": "u64"
          },
          {
            "name": "lastRewardIndex",
            "type": {
              "defined": "ZammI80F48"
            }
          },
          {
            "name": "readyToWithdraw",
            "type": {
              "defined": "ZammI80F48"
            }
          }
        ]
      }
    },
    {
      "name": "State",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "zamm",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nonce",
            "type": "u8"
          },
          {
            "name": "marketKey",
            "type": "publicKey"
          },
          {
            "name": "x",
            "type": "u64"
          },
          {
            "name": "totalLp",
            "type": "u64"
          },
          {
            "name": "marginKey",
            "type": "publicKey"
          },
          {
            "name": "status",
            "type": {
              "defined": "ZammStatus"
            }
          },
          {
            "name": "rewardRate",
            "type": "u64"
          },
          {
            "name": "rateLastUpdated",
            "type": "u64"
          },
          {
            "name": "rewardIndex",
            "type": {
              "defined": "ZammI80F48"
            }
          },
          {
            "name": "rewardVault",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ZammI80F48",
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
      "name": "ZammStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "OrdersCancelled"
          },
          {
            "name": "IOrdersPlaced"
          },
          {
            "name": "IIOrdersPlaced"
          },
          {
            "name": "IIIOrdersPlaced"
          },
          {
            "name": "IVOrdersPlaced"
          },
          {
            "name": "VOrdersPlaced"
          },
          {
            "name": "Paused"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidArgument",
      "msg": "At"
    },
    {
      "code": 6001,
      "name": "InvalidZammStatus",
      "msg": "Zamm"
    },
    {
      "code": 6002,
      "name": "UncancelledOrders",
      "msg": "Some"
    },
    {
      "code": 6003,
      "name": "InvalidZoState",
      "msg": "Invalid"
    },
    {
      "code": 6004,
      "name": "InvalidTokenAccount",
      "msg": "Invalid"
    },
    {
      "code": 6005,
      "name": "SlippageExceeded",
      "msg": "Slippage"
    },
    {
      "code": 6006,
      "name": "InvalidEventQueue",
      "msg": "Event"
    },
    {
      "code": 6007,
      "name": "EventQueueNotCleared",
      "msg": "Zamm"
    }
  ]
}
