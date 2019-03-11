function elementMatches($el, selector) {
  /* istanbul ignore if: only for older IE */
  if (!$el.matches) {
    return $el.msMatchesSelector(selector);
  } else {
    return $el.matches(selector);
  }
}

export default function matches(selector, match) {
  if (typeof match === 'undefined') {
    match = selector;
    selector = null;
  }

  return elementMatches(this.$(selector), match);
}
