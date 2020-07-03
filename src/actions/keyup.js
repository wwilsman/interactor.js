import Keyboard from '../keyboard';
import { dispatch } from '../dom';
import { assign } from '../utils';

// Shared function to trigger a keyup event on an element.
export function exec($element, parsed) {
  dispatch($element, 'keyup', assign({ cancelable: false }, parsed));
}

// Interactor method to add a keyup action to the interactor's queue.
export default function keyup(key) {
  let [k, parsed] = Keyboard.parse(this, 'keyup', key);

  return Keyboard.assign(k, this.exec($element => {
    exec($element, parsed);
  }));
}
