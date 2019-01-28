import { validationFor } from '../utils/validation';

const { self, top } = window;

function documentHasFocus() {
  /* istanbul ignore if: if the top document has focus when in an
   * iframe, this will set focus to the this iframe's document */
  if (!document.hasFocus() && self !== top && window.frameElement) {
    window.frameElement.focus();
  }

  return document.hasFocus();
}

export function focusable(validate, element) {
  let tabbable = ('tabIndex' in element) && element.tabIndex > -1;
  let result = tabbable && documentHasFocus();

  let reason = (tabbable && !result)
    /* istanbul ignore next: encountered when browser is unfocused */
    ? 'the document does not have focus'
    : 'tabindex must be greater than -1';

  return validate(result, `not focusable, ${reason}`, 'focusable');
}

export default function isFocusable(selector) {
  return validationFor(selector, focusable);
}
