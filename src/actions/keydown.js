import Keyboard from '../keyboard';
import { dispatch } from '../dom';

// Shared function to trigger a parsed keydown event on an element and possibly type resulting text
// into the element within an optional range.
export function exec($element, parsed, k, range) {
  let cancelled = !dispatch($element, 'keydown', parsed.event);

  if (!cancelled &&
      (parsed.text ||
       parsed.event.key === 'Backspace' ||
       parsed.event.key === 'Delete')) {
    k.input($element, parsed, range);
  }
}

// Interactor method to add a keydown action to the interactor's queue.
export default function keydown(key, { range } = {}) {
  let [k, parsed] = Keyboard.parse(this, 'keydown', key);

  return Keyboard.assign(k, this.exec($element => {
    exec($element, parsed, k, range);
  }));
}
