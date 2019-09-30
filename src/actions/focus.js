import scoped from '../helpers/scoped';

/* istanbul ignore next: the document always has focus during tests so this
 * function is never encountered */
function isFramed({ self, top, frameElement }) {
  return self !== top && !!frameElement;
}

/* istanbul ignore next: the document always has focus during tests so the
 * second half of the condition below is never encountered */
function hasFocus({ document }) {
  // in some environments (jsdom), hasFocus can return false incorrectly
  return document.hasFocus() || document.body === document.activeElement;
}

export default function focus(selector) {
  return scoped(selector)
  // perform focusable validation
    .assert.focusable()
    .assert.f('Failed to focus %s: %e')
  // invoke the native DOM method
    .do(function(element) {
      // if in an iframe, try to steal focus
      /* istanbul ignore next: document always has focus during tests */
      if (!hasFocus(this.$dom) && isFramed(this.$dom)) {
        this.$dom.frameElement.focus();
      }

      // if the document cannot be focused, the element cannot recieve focus
      /* istanbul ignore next: document always has focus during tests */
      if (!hasFocus(this.$dom)) {
        throw new Error('the document is not focusable');
      }

      element.focus();
    });
}
