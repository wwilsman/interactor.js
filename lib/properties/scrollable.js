import { assertion } from '../assert.js';
import { isScrollableX } from './scrollable-x.js';
import { isScrollableY } from './scrollable-y.js';

export function get() {
  let $el = this.$();

  return isScrollableY(this, $el) ||
    isScrollableX(this, $el);
}

export const assert = assertion(get, result => ({
  message: '%{@} has %{- no} overflow',
  result
}));
