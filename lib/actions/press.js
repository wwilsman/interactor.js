import Keyboard from '../keyboard.js';

function getSelectedTextRange($) {
  let win = $.ownerDocument.defaultView;
  let sel = win.getSelection();
  let start, end;

  // input elements have dedicated properties
  if ('selectionStart' in $) {
    ({ selectionStart: start, selectionEnd: end } = $);

    // for content-editable elements, the range needs to be calculated
  } else if (sel.containsNode($, true) ||
    // jsdom returns false for the above if the selection is within the element
    $.contains(sel.anchorNode) || $.contains(sel.focusNode)) {
    let range = sel.getRangeAt(0);
    let caretRange = range.cloneRange();

    caretRange.selectNodeContents($);
    caretRange.setEnd(range.startContainer, range.startOffset);
    start = caretRange.toString().length;

    caretRange.setEnd(range.endContainer, range.endOffset);
    end = caretRange.toString().length;
  }

  // only return the range when there is one
  if (start || end)
    return [start, end];
}

const input = ({ text, event, replace, range }) => function* input({ i, $ }) {
  event = text ? { charCode: text.charCodeAt(0), ...event } : event;
  range &&= [].concat(range);

  // input events only happen on input elements (or content-editable elements)
  let isInput = (/^(input|textarea)$/i).test($.tagName);
  if (!isInput && !$.isContentEditable) return;

  // sometimes, the `value` property of input elements is modified by frameworks and will not
  // reflect changes to this property; to work around this, we cache any custom value property
  // descriptor and reapply it later
  let descr = isInput && Object.getOwnPropertyDescriptor($, 'value');
  if (descr) delete $.value;

  // trigger and check if beforeinput event is canceled
  let canceled = !(yield i.trigger('beforeinput', event));

  if (!canceled) {
    // get the current value
    let value = isInput ? $.value : $.textContent;

    // range fallback to value length when replacing
    if (replace) range ??= [0, value.length];
    // range fallback to selected text or end of value
    range = [].concat(range ?? getSelectedTextRange($) ?? value.length);
    // start and end at the same index when only one is provided
    if (range.length === 1) range = [range[0], range[0]];
    // adjust the range if backspace or delete was pressed
    if (event.key === 'Backspace') range[0] -= 1;
    if (event.key === 'Delete') range[1] += 1;

    // erase text encapsulated by the range
    value = value.slice(0, range[0]) + text + value.slice(range[1]);

    // apply the new value
    if (isInput) $.value = value;
    else $.textContent = value;

    // dispatch a final input event
    yield i.trigger('input', { cancelable: false, ...event });
  }

  // restore any artificial value property descriptor
  if (descr) Object.defineProperty($, 'value', descr);
};

/**
 * @param {(string | string[])} keys
 * @param {Object} [options]
 * @param {boolean} [options.hold]
 * @param {boolean} [options.replace]
 * @param {number | [number] | [number, number]} [options.range]
 * @returns {import('../context').ContextGenerator<{ keyboard?: Keyboard }>}
 */
export function* press(keys, options) {
  keys = typeof keys === 'string' ? keys.split('+') : keys;

  let { keyboard } = yield ({ set, keyboard }) => set({
    immediate: { keyboard: new Keyboard(keyboard) }
  });

  for (let key of keys) {
    let { text, event } = keyboard.parse(key);
    let canceled = !(yield this.trigger('keydown', event));
    if (!canceled && (text || event.key === 'Backspace' || event.key === 'Delete'))
      // @ts-ignore
      yield input({ text, event, ...options });
    if (!keyboard.pressed(key)) keyboard.toggle(key);
  }

  if (!options?.hold) {
    for (let key of keys) {
      let { event } = keyboard.parse(key);
      yield this.trigger('keyup', { cancelable: false, ...event });
      keyboard.toggle(key);
    }
  }

  return ({ $ }) => $;
}

export default press;
