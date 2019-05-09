function elementMatches($el, selector) {
  /* istanbul ignore if: only for older IE */
  if (!$el.matches) {
    return $el.msMatchesSelector(selector);
  } else {
    return $el.matches(selector);
  }
}

export function args(a) {
  return a.length <= 1 ? [undefined, a[0]] : a;
}

export default function matches() {
  let [selector, match] = args(arguments);
  return elementMatches(this.$(selector), match);
}
