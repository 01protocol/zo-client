import {
  Program,
  Provider,
  getProvider as getProvider_,
  setProvider as setProvider_,
} from "@project-serum/anchor";
import { ZERO_ONE_IDL, ZERO_ONE_PROGRAM_ID } from "./config";
import { Zo } from "./types";

let _program: Program<Zo> | null = null;

export function setProvider(p: Provider) {
  setProvider_(p);
  _program = null;
}

export function getProvider(): Provider {
  const p = getProvider_();
  if (p === null) {
    throw Error("Provider not set, call setProvider first.");
  }
  return p;
}

export function setProgram(p: Program<Zo>) {
  setProvider(p.provider);
  _program = p;
}

export function getProgram(): Program<Zo> {
  if (_program === null) {
    _program = new Program<Zo>(
      ZERO_ONE_IDL as Zo,
      ZERO_ONE_PROGRAM_ID,
      getProvider(),
    );
  }
  return _program;
}
