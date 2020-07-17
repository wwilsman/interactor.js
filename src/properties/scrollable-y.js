import { assertion } from '../assert';
import { hasLayoutEngine } from '../dom';

export function isScrollableY(inst, $el) {
  return hasLayoutEngine(inst, 'Overflow') &&
    $el.scrollHeight > $el.clientHeight;
}

export function computed() {
  return isScrollableY(this, this.$());
}

export const assert = assertion(computed, result => ({
  message: '%{@} has %{- no} overflow-y',
  result
}));
