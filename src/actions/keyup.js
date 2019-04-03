import scoped from '../helpers/scoped';
import dispatch from '../utils/dispatch';
import { get, set } from '../utils/meta';

import {
  keyboard,
  getKeyDescr,
  setModifier
} from '../utils/keyboard';

const { assign } = Object;

export default function keyup(selector, key) {
  if (!key || typeof key !== 'string') {
    key = selector;
    selector = null;
  }

  return scoped(selector)
    .do(function(element) {
      let { pressed, modifiers } = keyboard(this);
      let descr = getKeyDescr(key, modifiers);

      pressed = pressed.filter(c => c !== descr.code);
      modifiers = setModifier(descr.key, false, modifiers);
      keyboard(this, { pressed, modifiers });

      let { text, ...opts } = assign({
        cancellable: false
      }, descr, modifiers);

      dispatch(element, 'keyup', opts);
    });
}
