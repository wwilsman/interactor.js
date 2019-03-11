export default function attribute(selector, attr) {
  if (typeof attr === 'undefined') {
    attr = selector;
    selector = null;
  }

  return this.$(selector).getAttribute(attr);
}
