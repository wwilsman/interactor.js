import error from '../error';
import { dom } from '../dom';

export function maybeFocusDocument(inst) {
  let { document, self, top, frameElement } = dom(inst);

  // if in an iframe, try to steal focus
  if (frameElement && !document.hasFocus() && self !== top) {
    frameElement.focus();
  }

  // if the document cannot be focused, the element cannot recieve focus
  if (!document.hasFocus()) {
    throw error('the document is not focusable');
  }
}

export default function focus() {
  return this
    .assert.focusable()
    .exec(function($el) {
      maybeFocusDocument(this);
      $el.focus();
    });
}
