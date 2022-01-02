"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEV_ENDPOINT = exports.WRAPPED_SOL_MINT = exports.RENT_PROGRAM_ID = exports.MEMO_PROGRAM_ID = exports.TOKEN_PROGRAM_ID = exports.SYSTEM_PROGRAM_ID = exports.SERUM_SWAP_PROGRAM_ID = exports.SERUM_SPOT_PROGRAM_ID = exports.ZO_DEX_PROGRAM_ID = exports.ZERO_ONE_PROGRAM_ID = exports.ZO_STATE_KEY = exports.USDC_DECIMALS = exports.ZO_OPTION_TAKER_FEE = exports.ZO_FUTURE_TAKER_FEE = exports.CONTROL_ACCOUNT_SIZE = exports.DEX_IDL = exports.IDL = void 0;
const web3_js_1 = require("@solana/web3.js");
var zo_1 = require("./types/zo");
Object.defineProperty(exports, "IDL", { enumerable: true, get: function () { return zo_1.IDL; } });
var dex_1 = require("./types/dex");
Object.defineProperty(exports, "DEX_IDL", { enumerable: true, get: function () { return dex_1.DEX_IDL; } });
// == ACCOUNT SIZES ==
exports.CONTROL_ACCOUNT_SIZE = 8 + 4482;
// == PARAMS ==
exports.ZO_FUTURE_TAKER_FEE = 0.001; // 10bps
exports.ZO_OPTION_TAKER_FEE = 0.001; // temporary value, not actual
exports.USDC_DECIMALS = 6;
// == 01 CONSTANTS ==
exports.ZO_STATE_KEY = new web3_js_1.PublicKey("HAdeMzG1ZuzhWnt26iyggLhYUen3YosXiD5sgDXJoNDY");
// == 01 PROGRAM IDS ==
exports.ZERO_ONE_PROGRAM_ID = new web3_js_1.PublicKey("DuSPvazsfthvWRuJ8TUs984VXCeUfJ1qbzd8NwkRLEpd");
exports.ZO_DEX_PROGRAM_ID = new web3_js_1.PublicKey("CX8xiCu9uBrLX5v3DSeHX5SEvGT36PSExES2LmzVcyJd");
exports.SERUM_SPOT_PROGRAM_ID = new web3_js_1.PublicKey("DESVgJVGajEgKGXhb6XmqDHGz3VjdgP7rEVESBgxmroY");
exports.SERUM_SWAP_PROGRAM_ID = new web3_js_1.PublicKey("BiUikS42eRsdmkGBu3qXDy8Tu4cuWYYnuFVZzKzjVEET");
// == SOLANA PROGRAM IDS ==
exports.SYSTEM_PROGRAM_ID = new web3_js_1.PublicKey("11111111111111111111111111111111");
exports.TOKEN_PROGRAM_ID = new web3_js_1.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
exports.MEMO_PROGRAM_ID = new web3_js_1.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
exports.RENT_PROGRAM_ID = new web3_js_1.PublicKey("SysvarRent111111111111111111111111111111111");
exports.WRAPPED_SOL_MINT = new web3_js_1.PublicKey("So11111111111111111111111111111111111111112");
// == CLUSTERS ==
exports.DEV_ENDPOINT = "https://api.devnet.solana.com";
