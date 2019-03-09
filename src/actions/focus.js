import scoped from '../helpers/scoped';

/* istanbul ignore next: the document always has focus during tests so this
 * function is never encountered */
function isFramed() {
  return window.self !== window.top && window.frameElement;
}

export default function focus(selector) {
  return scoped(selector)
  // perform focusable validation
    .assert.focusable()
    .assert.f('Failed to focus %s: %e')
  // invoke the native DOM method
    .do(element => {
      // if no document focus and in an iframe, try to steal focus
      /* istanbul ignore next: document always has focus during tests */
      if (!document.hasFocus() && isFramed()) {
        window.frameElement.focus();
      }

      // document does not have focus
      /* istanbul ignore if: document always has focus during tests */
      if (!document.hasFocus()) {
        throw new Error('the document is not focusable');
      }

      element.focus();
    });
}
