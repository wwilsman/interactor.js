import { parseKey } from '../keyboard';
import { exec as press } from './press';
import { dispatch } from '../dom';

// Interactor method to add a type action to the interactor's queue which will trigger keydown,
// input, and keyup events, for each character in the provied text string.
export default function type(text, { range, delay, change } = {}) {
  return this
    .assert.exists()
    .exec(async function($element) {
      // normalize the range as an array
      range = range != null && [].concat(range);

      // loop over each character
      for (let i = 0, l = text.length; i < l; i++) {
        // for the first char replace the range; otherwise insert after the previous char
        press($element, parseKey(this, text[i]), (
          range && (i === 0 ? range : range[0] + i)
        ));

        // delay between presses if needed
        if (delay && i !== text.length - 1) {
          await new Promise(r => setTimeout(r, delay));
        }
      }

      // trigger change events for form elements
      if (change && (/^(input|textarea)$/i).test($element.tagName)) {
        dispatch($element, 'change', { cancelable: false });
      }
    });
}
