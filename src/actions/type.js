import k from '../keyboard';
import { dispatch } from '../dom';
import { exec as press } from './press';

// Interactor method to add a type action to the interactor's queue which will trigger keydown,
// input, and keyup events, for each character in the provied text string.
export default function type(text, { range, delay, change } = {}) {
  return this
    .assert.exists()
    .exec(async function($element) {
      let parsed = [...text].map(c => k.parse(this, c));
      await press($element, parsed, range, delay);

      // trigger change events for form elements
      if (change && (/^(input|textarea)$/i).test($element.tagName)) {
        dispatch($element, 'change', { cancelable: false });
      }
    });
}
