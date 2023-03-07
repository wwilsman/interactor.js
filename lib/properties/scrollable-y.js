import { assertion } from '../assert.js';
import { hasLayoutEngine } from '../dom.js';

export function isScrollableY(inst, $el) {
  return hasLayoutEngine(inst, 'Overflow') &&
    $el.scrollHeight > $el.clientHeight;
}

export function get() {
  return isScrollableY(this, this.$());
}

export const assert = assertion(get, result => ({
  message: '%{@} has %{- no} overflow-y',
  result
}));
