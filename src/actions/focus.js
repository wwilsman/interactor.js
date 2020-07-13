import error from '../error';
import { dom } from '../dom';

export default function focus() {
  return this
    .assert.focusable()
    .exec(function($el) {
      let win = dom(this);

      // if in an iframe, try to steal focus
      if (!win.document.hasFocus() && win.self !== win.top && !!win.frameElement) {
        win.frameElement.focus();
      }

      // if the document cannot be focused, the element cannot recieve focus
      if (!win.document.hasFocus()) {
        throw error('the document is not focusable');
      }

      $el.focus();
    });
}
