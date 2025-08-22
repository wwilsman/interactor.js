/**
 * @param {import('../context').ContextOptions['selector']} [selector]
 * @returns {import('../context').ContextGenerator}
 */
export function* blur(selector) {
  yield this.find(selector);
  yield this.assert.focused();
  yield ({ $ }) => $.blur();
  return ({ $ }) => $;
}

export default blur;
