export const DEX_IDL = {
  "version": "0.1.0",
  "name": "dex",
  "instructions": [
  ],
  "events": [
    {
      "name": "RealizedPnlLog",
      "fields": [
        {
          "name": "marketKey",
          "type": {
            "array": ["u64", 4]
          },
          "index": false
        },
        {
          "name": "margin",
          "type": {
            "array": ["u64", 4]
          },
          "index": false
        },
        {
          "name": "isLong",
          "type": "bool",
          "index": false
        },
        {
          "name": "pnl",
          "type": "i64",
          "index": false
        },
        {
          "name": "qtyPaid",
          "type": "i64",
          "index": false
        },
        {
          "name": "qtyReceived",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "OpenOrdersSnapLog",
      "fields": [
        {
          "name": "nativePcFree",
          "type": "i64",
          "index": false
        },
        {
          "name": "nativePcTotal",
          "type": "i64",
          "index": false
        },
        {
          "name": "nativeCoinFree",
          "type": "i64",
          "index": false
        },
        {
          "name": "nativeCoinTotal",
          "type": "i64",
          "index": false
        },
        {
          "name": "realizedPnl",
          "type": "i64",
          "index": false
        },
        {
          "name": "coinOnBids",
          "type": "u64",
          "index": false
        },
        {
          "name": "coinOnAsks",
          "type": "u64",
          "index": false
        },
        {
          "name": "orderCount",
          "type": "u8",
          "index": false
        },
        {
          "name": "fundingIndex",
          "type": "i128",
          "index": false
        }
      ]
    },
    {
      "name": "SettleFunding",
      "fields": [
        {
          "name": "funding",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "UpdateFundingLog",
      "fields": [
        {
          "name": "oraclePrice",
          "type": "i64",
          "index": false
        },
        {
          "name": "indexPrice",
          "type": "i64",
          "index": false
        },
        {
          "name": "marketFundingIndex",
          "type": "i128",
          "index": false
        },
        {
          "name": "lastUpdated",
          "type": "u64",
          "index": false
        }
      ]
    }
  ]
}
