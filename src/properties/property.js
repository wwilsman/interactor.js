import { assertion } from '../assert';

export function method(prop) {
  return this.$()[prop];
}

export const assert = assertion(method, (actual, prop, expected) => ({
  message: `%{@} ${prop} is "${actual}" but expected %{- "${expected}"|it not to be}`,
  result: actual === expected
}));
