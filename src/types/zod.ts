export type Zod = {
  "version": "0.1.0",
  "name": "zod",
  "instructions": [
    {
      "name": "initZodState",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "zodState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zodStateSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgramStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoProgramState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoProgramMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
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
          "name": "zoProgramMarginRent",
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
          "name": "zodStateNonce",
          "type": "u8"
        },
        {
          "name": "zoProgramNonce",
          "type": "u8"
        },
        {
          "name": "zodStateSignerNonce",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "zodState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "zodStateNonce",
            "type": "u8"
          },
          {
            "name": "zoMarginNonce",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "zoProgramState",
            "type": "publicKey"
          },
          {
            "name": "zoProgramMargin",
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
            "name": "totalCollaterals",
            "type": "u16"
          }
        ]
      }
    }
  ]
};

export const IDL: Zod = {
  "version": "0.1.0",
  "name": "zod",
  "instructions": [
    {
      "name": "initZodState",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "zodState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zodStateSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "zoProgramStateSigner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoProgramState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoProgramMargin",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "zoProgram",
          "isMut": false,
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
          "name": "zoProgramMarginRent",
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
          "name": "zodStateNonce",
          "type": "u8"
        },
        {
          "name": "zoProgramNonce",
          "type": "u8"
        },
        {
          "name": "zodStateSignerNonce",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "zodState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "zodStateNonce",
            "type": "u8"
          },
          {
            "name": "zoMarginNonce",
            "type": "u8"
          },
          {
            "name": "admin",
            "type": "publicKey"
          },
          {
            "name": "zoProgramState",
            "type": "publicKey"
          },
          {
            "name": "zoProgramMargin",
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
            "name": "totalCollaterals",
            "type": "u16"
          }
        ]
      }
    }
  ]
};
