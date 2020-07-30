import { assertion } from '../assert';

export function call(selector) {
  return this.$().matches(selector);
}

export const assert = assertion(call, (result, selector) => ({
  message: `%{@} %{- does not match|matches} ${selector} ` +
    '%{- |but expected it not to}',
  result
}));
