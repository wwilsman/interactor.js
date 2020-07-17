import { hasLayoutEngine } from '../dom';

export function computed() {
  return hasLayoutEngine(this, 'Text content')
    ? this.$().innerText
    : this.$().textContent;
}
