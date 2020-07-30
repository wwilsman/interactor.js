import { assertion } from '../assert';
import { hasLayoutEngine } from '../dom';

export function isScrollableX(inst, $el) {
  return hasLayoutEngine(inst, 'Overflow') &&
    $el.scrollWidth > $el.clientWidth;
}

export function get() {
  return isScrollableX(this, this.$());
}

export const assert = assertion(get, result => ({
  message: '%{@} has %{- no} overflow-x',
  result
}));
