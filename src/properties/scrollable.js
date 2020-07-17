import { assertion } from '../assert';
import { isScrollableX } from './scrollable-x';
import { isScrollableY } from './scrollable-y';

export function computed() {
  let $el = this.$();

  return isScrollableY(this, $el) ||
    isScrollableX(this, $el);
}

export const assert = assertion(computed, result => ({
  message: '%{@} has %{- no} overflow',
  result
}));
