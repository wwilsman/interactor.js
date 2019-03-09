export default function computed(selector, getter) {
  if (arguments.length === 1) {
    getter = selector;
    selector = null;
  }

  return {
    enumerable: false,
    configurable: false,

    get() {
      return getter.call(this, (
        selector ? this.$(selector) : (
          getter.length > 0 ? this.$element : undefined
        )
      ));
    }
  };
}
