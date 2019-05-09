import meta from '../utils/meta';

export default function computed(selector, getter, matcher) {
  if (selector && typeof selector !== 'string') {
    matcher = getter;
    getter = selector;
    selector = null;
  }

  return {
    enumerable: false,
    configurable: false,

    // auto-define an assertion
    [meta]: { matcher },

    // computed getter
    get() {
      return getter.call(this, (
        selector ? this.$(selector) : (
          getter.length > 0 ? this.$element : undefined
        )
      ));
    }
  };
}
