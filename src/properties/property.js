import { assertion } from '../assert';
import { hasLayoutEngine } from '../dom';

const LAYOUT_PROPS = [
  'scrollTop',
  'scrollLeft',
  'scrollWidth',
  'scrollHeight',
  'clientTop',
  'clientLeft',
  'clientWidth',
  'clientHeight'
];

export function call(prop) {
  if (LAYOUT_PROPS.includes(prop)) {
    hasLayoutEngine(this, 'Layout');
  }

  return this.$()[prop];
}

export const assert = assertion(call, (actual, prop, expected) => ({
  message: `%{@} ${prop} is "${actual}" but expected %{- "${expected}"|it not to be}`,
  result: actual === expected
}));
