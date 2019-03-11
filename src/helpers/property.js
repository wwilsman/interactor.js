export default function property(selector, prop) {
  if (typeof prop === 'undefined') {
    prop = selector;
    selector = null;
  }

  return this.$(selector)[prop];
}
