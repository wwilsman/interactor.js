import k from '../keyboard';
import { dispatch } from '../dom';
import { exec as press } from './press';
import { maybeFocusDocument } from './focus';
import { get as focused } from '../properties/focused';

// Interactor method to add a type action to the interactor's queue which will trigger keydown,
// input, and keyup events, for each character in the provied text string.
export default function type(text, {
  range,
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
        maybeFocusDocument(this);
        $element.focus();
      }

      // type the text by pressing each key
      let parsed = [...text].map(c => k.parse(this, c));
      await press($element, parsed, range, delay);

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
