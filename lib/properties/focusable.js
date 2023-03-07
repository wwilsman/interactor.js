import error from '../error.js';

export function get() {
  return !this.disabled && !!(
    ~this.$().tabIndex || this.$().isContentEditable
  );
}

export function assert(expected) {
  let result = get.call(this);

  if (expected)
    this.assert.not.disabled();

  if (result !== expected)
    throw error('%{@} is %{- not} focusable');
}
