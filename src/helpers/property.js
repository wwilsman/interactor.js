import { hasLayoutEngine } from '../utils/dom';

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

export function args(a) {
  return a.length <= 1 ? [undefined, a[0]] : a;
}

export default function property() {
  let [selector, prop] = args(arguments);

  if (LAYOUT_PROPS.includes(prop)) {
    hasLayoutEngine.call(this, `Properties effected by the result of CSS cannot be calculated (${prop})`);
  }

  return this.$(selector)[prop];
}
