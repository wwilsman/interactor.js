import { hasLayoutEngine } from '../dom';

export function get() {
  return hasLayoutEngine(this, 'Text content')
    ? this.$().innerText
    : this.$().textContent;
}
