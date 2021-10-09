import {
  Program,
  Provider,
  getProvider as getProvider_,
  setProvider as setProvider_,
} from "@project-serum/anchor";
import { IDL_MARGIN, ZERO_ONE_MARGIN_PROGRAM_ID } from "./config";

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

let _program: Program | null = null;

export function setProgram(p: Program) {
  setProvider(p.provider);
  _program = p;
}

export function getProgram(): Program {
  if (_program === null) {
    _program = new Program(
      IDL_MARGIN,
      ZERO_ONE_MARGIN_PROGRAM_ID,
      getProvider(),
    );
  }
  return _program;
}
