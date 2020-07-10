import { assertion } from '../assert';

export function method(attr) {
  return this.$().getAttribute(attr);
}

export const assert = assertion(method, (actual, attr, expected) => ({
  message: `%{@} ${attr} is "${actual}" but expected %{- "${expected}"|it not to be}`,
  result: actual === expected
}));
