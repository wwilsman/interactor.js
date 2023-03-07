import { hasLayoutEngine } from '../dom.js';

export function get() {
  return hasLayoutEngine(this, 'Text content')
    ? this.$().innerText
    : this.$().textContent;
}
