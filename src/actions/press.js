import { execKey } from '../keyboard';
import { exec as keydown } from './keydown';
import { exec as keyup } from './keyup';

// Shared function to trigger keydown and keyup events on an element and possibly type resulting
// text into the element within an optional range.
export function exec($element, parsed, range) {
  keydown($element, parsed, range);
  keyup($element, parsed);
}

// Interactor method to add a press action to the interactor's queue which will trigger keydown and
// keyup events for a specified key.
export default function press(key, { range } = {}) {
  return execKey(this, key, ($element, parsed) => {
    exec($element, parsed, range);
  });
}
