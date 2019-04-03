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

export default function press(selector, key, options = {}) {
  if (!key || typeof key !== 'string') {
    options = key || options;
    key = selector;
    selector = null;
  }

  return scoped(selector)
    .do(async function(element) {
      let { modifiers } = keyboard(this);
      let descr = getKeyDescr(key, modifiers);

      modifiers = setModifier(descr.key, true, modifiers);
      let { text, ...opts } = assign({}, descr, modifiers);
      let cancelled = !dispatch(element, 'keydown', opts);

      if (!cancelled && (text || isBackOrDel(descr.key))) {
        inputText(element, text, opts, options.range);
      }

      if (options.delay) {
        await new Promise(resolve => setTimeout(resolve, options.delay));
      }

      modifiers = setModifier(descr.key, false, modifiers);
      opts = assign({ cancellable: false }, opts, modifiers);
      dispatch(element, 'keyup', opts);
    });
}
