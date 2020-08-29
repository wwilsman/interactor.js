import error from '../error';

export function exec($element) {
  let win = $element.ownerDocument.defaultView;
  let { document, self, top, frameElement } = win;

  // if in an iframe, try to steal focus
  if (frameElement && !document.hasFocus() && self !== top) {
    frameElement.focus();
  }

  // if the document cannot be focused, the element cannot recieve focus
  if (!document.hasFocus()) {
    throw error('the document is not focusable');
  }

  $element.focus();
}

export default function focus() {
  return this
    .assert.focusable()
    .exec(exec);
}
