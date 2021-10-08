export function concatTypedArrays(a, b) {
  // a, b TypedArray of same type
  let c = new a.constructor(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}
