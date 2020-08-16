import { assertion } from '../assert';

export function value(selector) {
  return this.$().matches(selector);
}

export const assert = assertion(value, (result, selector) => ({
  message: `%{@} %{- does not match|matches} ${selector} ` +
    '%{- |but expected it not to}',
  result
}));
