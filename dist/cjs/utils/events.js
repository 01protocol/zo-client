"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
const anchor_1 = require("@project-serum/anchor");
// t is a base64 encoded string
function decode(t, idl) {
    const coder = new anchor_1.Coder(idl);
    const event = coder.events.decode(t);
    return event;
}
exports.decode = decode;
