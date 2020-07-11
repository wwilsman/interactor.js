import { assertion } from '../assert';

export function method(selector) {
  return this.$().matches(selector);
}

export const assert = assertion(method, (result, selector) => ({
  message: `%{@} %{- does not match|matches} ${selector} ` +
    '%{- |but expected it not to}',
  result
}));
