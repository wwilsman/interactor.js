import { assertion } from '../assert';

// .count(selector)
export function method(selector) {
  return this.$$(selector).length;
}

// use a matcher with arguments
export const assert = assertion(method, (actual, selector, expected) => ({
  message: `found ${actual} element${actual === 1 ? '' : 's'} ` +
    `matching %{@ ${selector}} but expected %{- ${expected}|not to}`,
  result: actual === expected
}));
