import Assertion from '../assertion.js';

function documentFocusable({ $ }) {
  let { frameElement, document, self, top } = $.ownerDocument.defaultView;
  if (frameElement && !document.hasFocus() && self !== top) frameElement.focus();
  return document.hasFocus();
}

export class FocusableAssertion extends Assertion {
  constructor() {
    function* focusable({ $ }) {
      yield this.assert.not.disabled();
      yield this.assert(documentFocusable, 'The document is not focusable');
      return !!(~$.tabIndex || $.isContentEditable);
    }

    super(focusable,
      '#{this} is not focusable',
      '#{this} is focusable'
    );
  }
}

export default FocusableAssertion;
