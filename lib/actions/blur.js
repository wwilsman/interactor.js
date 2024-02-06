/**
 * @param {import('../context').ContextOptions['selector']} [selector]
 * @returns Generator<((context: import('../context').Context) => any) | any, any, any>
 */
export function* blur(selector) {
  yield this.find(selector);
  yield this.assert.focused();
  yield ({ $ }) => $.blur();
}

export default blur;
