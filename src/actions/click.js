import scoped from '../properties/scoped';

export function click(selector) {
  return this
  // possibly scoped to a selector
    .scoped(selector, false)
  // perform clickable validation
    .validate(
      ['focusable', '!disabled'],
      'Failed to click %s: %e'
    )
  // invoke the native DOM method
    .do(element => {
      element.click();
    });
}

export default function(selector) {
  return scoped(selector).click();
}
