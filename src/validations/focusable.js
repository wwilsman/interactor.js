import validation from '../utils/validation';

const { self, top } = window;

function documentHasFocus() {
  /* istanbul ignore next: if the top document has focus when in an
   * iframe, this will set focus to the this iframe's document */
  if (!document.hasFocus() && self !== top && window.frameElement) {
    window.frameElement.focus();
  }

  return document.hasFocus();
}

export default function focusable(selector) {
  return validation(function(validate, element) {
    element = this.$(selector || element);
    let tabbable = ('tabIndex' in element) && element.tabIndex > -1;
    let result = tabbable && documentHasFocus();

    return validate(result, () => {
      /* istanbul ignore next: encountered when browser is unfocused */
      let reason = (tabbable && !result)
        ? 'the document does not have focus'
        : 'tabindex must be greater than -1';

      return (selector ? `"${selector}" ` : '') +
        (result ? 'focusable' : `not focusable, ${reason}`);
    });
  });
}
