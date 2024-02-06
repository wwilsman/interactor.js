/**
 * @param {import('../context').ContextOptions['selector']} [selector]
 * @returns Generator<any, any, any>
 */
export function* focus(selector) {
  yield this.find(selector);
  yield this.assert.focusable();
  yield ({ $ }) => $.focus();
}

export default focus;
