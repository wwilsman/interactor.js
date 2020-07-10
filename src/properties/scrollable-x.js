import { assertion } from '../assert';

export function isScrollableX($el) {
  return $el.scrollWidth > $el.clientWidth;
}

export function computed() {
  return isScrollableX(this.$());
}

export const assert = assertion(computed, result => ({
  message: '%{@} has %{- no} overflow-x',
  result
}));
