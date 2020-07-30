import { assertion } from '../assert';
import { isScrollableX } from './scrollable-x';
import { isScrollableY } from './scrollable-y';

export function get() {
  let $el = this.$();

  return isScrollableY(this, $el) ||
    isScrollableX(this, $el);
}

export const assert = assertion(get, result => ({
  message: '%{@} has %{- no} overflow',
  result
}));
