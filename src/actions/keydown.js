import k from '../keyboard';
import { dispatch } from '../dom';

import {
  assign,
  defineProperty,
  getOwnPropertyDescriptor
} from '../utils';

// Returns any selected text range
function getTextRange($element) {
  let win = $element.ownerDocument.defaultView;
  let sel = win.getSelection();
  let start, end;

  // input elements have dedicated properties
  if ('selectionStart' in $element) {
    ({ selectionStart: start, selectionEnd: end } = $element);

  // for content-editable elements, the range needs to be calculated
  } else if (sel.containsNode($element, true) ||
      // jsdom returns false for the above if the selection is within the element
      $element.contains(sel.anchorNode) || $element.contains(sel.focusNode)) {
    let range = sel.getRangeAt(0);
    let caretRange = range.cloneRange();
    caretRange.selectNodeContents($element);

    caretRange.setEnd(range.startContainer, range.startOffset);
    start = caretRange.toString().length;

    caretRange.setEnd(range.endContainer, range.endOffset);
    end = caretRange.toString().length;
  }

  // only return the range when there is one
  if (start || end) {
    return [start, end];
  }
}

// Shared function to trigger a parsed keydown event and type resulting text into the element.
export function exec($element, parsed, { range, replace }) {
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
    // get the current value
    let value = isInput ? $element.value : $element.textContent;

    // set the range when replacing, get any existing range, or fall back to the end of the input
    range = replace ? [0, value.length] : range;
    range = [].concat(range || getTextRange($element) || value.length);
    if (range.length === 1) range[1] = range[0];

    // adjust the range if backspace or delete was pressed
    if (event.key === 'Backspace') range[0] -= 1;
    if (event.key === 'Delete') range[1] += 1;

    // erase text encapsulated by the range
    value = value.slice(0, range[0]) + char + value.slice(range[1]);

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
export default function keydown(key, options = {}) {
  return k.press(key, true, (
    this
      .assert.exists()
      .exec(function($element) {
        exec($element, k.parse(this, key), options);
      })
  ));
}
