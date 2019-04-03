import scoped from '../helpers/scoped';
import dispatch from '../utils/dispatch';

import {
  keyboard,
  getKeyDescr,
  isInputElement,
  inputText
} from '../utils/keyboard';

const { assign, entries } = Object;

export default function type(selector, string, options = {}) {
  if (typeof string === 'object' || !string) {
    options = string || options;
    string = selector;
    selector = null;
  }

  return scoped(selector)
    .assert(element => {
      if (isInputElement(element)) {
        if (element.disabled) throw new Error('disabled');
      } else if (!element.isContentEditable) {
        throw new Error('not an input, textarea, or content editable element');
      }
    })
    .assert.f('Failed to type in %s: %e')
    .do(async function(element) {
      let { modifiers } = keyboard(this);
      let { range, delay } = options;
      range = range != null && [].concat(range);

      for (let [i, key] of entries(string)) {
        i = parseInt(i, 10);

        let descr = getKeyDescr(key, modifiers);
        let { text, ...opts } = assign({}, descr, modifiers);
        let cancelled = !dispatch(element, 'keydown', opts);

        if (!cancelled) {
          inputText(element, key, opts, range && (
            i === 0 ? range : range[0] + i
          ));
        }

        dispatch(element, 'keyup', assign({
          cancelable: false
        }, opts));

        if (delay && i !== string.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      if (options.change && isInputElement(element)) {
        dispatch(element, 'change', { cancelable: false });
      }
    });
}
