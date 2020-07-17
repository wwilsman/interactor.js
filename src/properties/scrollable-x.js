import { assertion } from '../assert';
import { hasLayoutEngine } from '../dom';

export function isScrollableX(inst, $el) {
  return hasLayoutEngine(inst, 'Overflow') &&
    $el.scrollWidth > $el.clientWidth;
}

export function computed() {
  return isScrollableX(this, this.$());
}

export const assert = assertion(computed, result => ({
  message: '%{@} has %{- no} overflow-x',
  result
}));
