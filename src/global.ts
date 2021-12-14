import {
  getProvider as getProvider_,
  Program,
  Provider,
  setProvider as setProvider_,
} from "@project-serum/anchor";
import { IDL, Zo } from "./types/zo";
import { ZERO_ONE_PROGRAM_ID } from "./config";

let _program: Program<Zo> | null = null;

export function setProvider(p: Provider) {
  setProvider_(p);
  setProgram();
}

export function getProgram(): Program<Zo> {
  _program = new Program<Zo>(IDL, ZERO_ONE_PROGRAM_ID, getProvider());
  return _program;
}

export function setProgram() {
  _program = getProgram();
}

export function getProvider(): Provider {
  const p = getProvider_();
  if (p === null) {
    throw Error("Provider not set, call setProvider first.");
  }
  return p;
}
