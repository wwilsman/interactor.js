import k from '../keyboard';
import { dispatch } from '../dom';

import {
  assign,
  defineProperty,
  getOwnPropertyDescriptor
} from '../utils';

// Shared function to trigger a parsed keydown event and type resulting text into the element.
export function exec($element, parsed, range) {
  let { text: char, event } = parsed;
  let cancelled = !dispatch($element, 'keydown', event);

  // abort if cancelled, or if no text and not the backspace or delete key
  if (cancelled || !(char || event.key === 'Backspace' || event.key === 'Delete')) return;

  // input events only happen on input elements (or content-editable elements)
  let isInput = (/^(input|textarea)$/i).test($element.tagName);
  if (!isInput && !$element.isContentEditable) return;

  // sometimes, the `value` property of input elements is modified by frameworks and will not
  // reflect changes to this property; to work around this, we cache any custom value property
  // descriptor and reapply it later
  let descr = isInput && getOwnPropertyDescriptor($element, 'value');
  if (descr) delete $element.value;

  // add the charCode to the event options
  event = char ? assign({ charCode: char.charCodeAt(0) }, event) : event;

  // trigger and check if keypress or beforeinput events are cancelled
  cancelled = !dispatch($element, 'keypress', event) ||
    !dispatch($element, 'beforeinput', event);

  if (!cancelled) {
    // get the current value and range
    let value = isInput ? $element.value : $element.textContent;
    range = range || value.length;

    // adjust the range if backspace or delete was pressed
    if (typeof range === 'number') {
      range = [
        event.key === 'Backspace' ? range - 1 : range,
        event.key === 'Delete' ? range + 1 : range
      ];
    }

    // erase text encapsulated by the range
    value = value.slice(0, range[0]) + char + (
      value.slice(range[1] || range[0])
    );

    // apply the new value
    if (isInput) {
      $element.value = value;
    } else {
      $element.textContent = value;
    }

    // trigger a final input event
    dispatch($element, 'input', assign({ cancelable: false }, event));
  }

  // restore any artificial value property descriptor
  if (descr) defineProperty($element, 'value', descr);
}

// Interactor method to add a keydown action to the interactor's queue.
export default function keydown(key, { range } = {}) {
  return k.press(key, true, (
    this
      .assert.exists()
      .exec(function($element) {
        exec($element, k.parse(this, key), range);
      })
  ));
}
