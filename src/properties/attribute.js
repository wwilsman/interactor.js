import { assertion } from '../assert';

export function call(attr) {
  return this.$().getAttribute(attr);
}

export const assert = assertion(call, (actual, attr, expected) => ({
  message: `%{@} ${attr} is "${actual}" but expected %{- "${expected}"|it not to be}`,
  result: actual === expected
}));
