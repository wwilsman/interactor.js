/**
 * @param {import('../context').ContextOptions['selector']} [selector]
 * @returns {import('../context').ContextGenerator}
 */
export function* focus(selector) {
  yield this.find(selector);
  yield this.assert.focusable();
  yield ({ $ }) => $.focus();
}

export default focus;
