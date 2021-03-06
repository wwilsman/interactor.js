import k from '../keyboard';
import { dispatch } from '../dom';
import { exec as press } from './press';
import { exec as focusElement } from './focus';
import { get as focused } from '../properties/focused';

// Interactor method to add a type action to the interactor's queue which will trigger keydown,
// input, and keyup events, for each character in the provied text string.
export default function type(text, {
  range,
  replace,
  delay,
  focus = true,
  blur = true,
  change = blur
} = {}) {
  return this
    .assert.focusable()
    .exec(async function($element) {
      // maybe focus the element
      if (focus && !focused.call(this)) {
        focusElement($element);
      }

      // type the text by pressing each key
      let parsed = [...text].map(c => k.parse(this, c));
      await press($element, parsed, { range, replace, delay });

      // trigger change events for input and textarea elements
      if (change && (/^(input|textarea)$/i).test($element.tagName)) {
        dispatch($element, 'change', { cancelable: false });
      }

      // maybe blur the element
      if (blur && focused.call(this)) {
        $element.blur();
      }
    });
}
