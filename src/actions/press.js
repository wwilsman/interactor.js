import Keyboard from '../keyboard';
import { exec as keydown } from './keydown';
import { exec as keyup } from './keyup';

// Shared function to trigger keydown and keyup events on an element and possibly type resulting
// text into the element within an optional range.
export function exec($element, key, range) {
  let [k, parsed] = Keyboard.parse(this, 'press', key);
  keydown($element, parsed, k, range);
  keyup($element, parsed);
}

// Interactor method to add a press action to the interactor's queue which will trigger keydown and
// keyup events for a specified key.
export default function press(key, { range } = {}) {
  return this.exec(function($element) {
    exec.call(this, $element, key, range);
  });
}
