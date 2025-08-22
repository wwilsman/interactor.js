/**
 * @param {import('../context').ContextOptions['selector']} [selector]
 * @returns {import('../context').ContextGenerator}
 */
export function* click(selector) {
  yield this.find(selector);
  yield this.assert.not.disabled();

  let $option = yield ({ $ }) => $.tagName.toLowerCase() === 'option' ? $ : $.closest('option');
  let $select = $option?.closest('select');

  if ($select) {
    yield this.assert(!$select.disabled, '#{this} select is disabled');
    $option.selected = $select.multiple ? !$option.selected : true;

    yield this.find($select);
    yield this.trigger('input', { cancelable: false });
    yield this.trigger('change', { cancelable: false });
  } else {
    yield ({ $ }) => $.click();
  }

  return ({ $ }) => $;
}

export default click;
