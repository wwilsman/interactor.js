import { assertion } from '../assert';

export function isScrollableY($el) {
  return $el.scrollHeight > $el.clientHeight;
}

export function computed() {
  return isScrollableY(this.$());
}

export const assert = assertion(computed, result => ({
  message: '%{@} has %{- no} overflow-y',
  result
}));
