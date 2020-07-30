import { assertion } from '../assert';

export function call(selector) {
  return this.$$(selector).length;
}

export const assert = assertion(call, (actual, selector, expected) => ({
  message: `found ${actual} element${actual === 1 ? '' : 's'} ` +
    `matching %{@ ${selector}} but expected %{- ${expected}|not to}`,
  result: actual === expected
}));
