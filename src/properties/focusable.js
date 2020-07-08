import error from '../error';

export function computed() {
  return !this.disabled && !!~this.$().tabIndex;
}

export function assert(expected) {
  let result = computed.call(this);

  if (expected) {
    this.assert.not.disabled();
  }

  if (result !== expected) {
    throw error('%{@} is %{- not} focusable');
  }
}
