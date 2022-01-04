import { Coder, Idl, Event } from "@project-serum/anchor";

// t is a base64 encoded string
export function decode(t: string, idl: Idl): Event | null {
  const coder = new Coder(idl);
  const event = coder.events.decode(t);
  return event;
}
