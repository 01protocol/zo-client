import { Coder } from "@project-serum/anchor";
// t is a base64 encoded string
export function decode(t, idl) {
    const coder = new Coder(idl);
    const event = coder.events.decode(t);
    return event;
}
