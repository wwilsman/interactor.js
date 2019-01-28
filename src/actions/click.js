import scoped from '../properties/scoped';

export default function click(selector) {
  return scoped(selector)
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
