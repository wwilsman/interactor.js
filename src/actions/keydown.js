import scoped from '../helpers/scoped';
import dispatch from '../utils/dispatch';

import {
  keyboard,
  getKeyDescr,
  setModifier,
  isBackOrDel,
  inputText
} from '../utils/keyboard';

const { assign } = Object;

export default function keydown(selector, key, options = {}) {
  if (!key || typeof key !== 'string') {
    options = key || options;
    key = selector;
    selector = null;
  }

  return scoped(selector)
    .do(function(element) {
      let { pressed, modifiers } = keyboard(this);
      let descr = getKeyDescr(key, modifiers);
      let repeat = pressed.includes(descr.code);

      pressed = repeat ? pressed : pressed.concat(descr.code);
      modifiers = setModifier(descr.key, true, modifiers);
      keyboard(this, { pressed, modifiers });

      let { text, ...opts } = assign({ repeat }, descr, modifiers);
      let cancelled = !dispatch(element, 'keydown', opts);

      if (!cancelled && (text || isBackOrDel(descr.key))) {
        inputText(element, text, opts, options.range);
      }
    });
}
