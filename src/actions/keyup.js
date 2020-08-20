import k from '../keyboard';
import { dispatch } from '../dom';

// Shared function to trigger a keyup event on an element.
export function exec($element, { event }) {
  dispatch($element, 'keyup', { cancelable: false, ...event });
}

// Interactor method to add a keyup action to the interactor's queue.
export default function keyup(key) {
  return k.press(key, false, (
    this
      .assert.exists()
      .exec(function($element) {
        exec($element, k.parse(this, key));
      })
  ));
}
