import { hasLayoutEngine } from '../dom.js';

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

export function value(prop) {
  if (LAYOUT_PROPS.includes(prop))
    hasLayoutEngine(this, 'Layout');

  return this.$()[prop];
}
