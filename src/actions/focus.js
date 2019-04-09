import scoped from '../helpers/scoped';

/* istanbul ignore next: the document always has focus during tests so this
 * function is never encountered */
function isFramed({ self, top, frameElement }) {
  return self !== top && frameElement;
}

export default function focus(selector) {
  return scoped(selector)
  // perform focusable validation
    .assert.focusable()
    .assert.f('Failed to focus %s: %e')
  // invoke the native DOM method
    .do(function(element) {
      // if no document focus and in an iframe, try to steal focus
      /* istanbul ignore next: document always has focus during tests */
      if (!this.$dom.document.hasFocus() && isFramed(this.$dom)) {
        this.$dom.frameElement.focus();
      }

      // document does not have focus
      /* istanbul ignore if: document always has focus during tests */
      if (!this.$dom.document.hasFocus()) {
        throw new Error('the document is not focusable');
      }

      element.focus();
    });
}
