import scoped from '../properties/scoped';

export default function focus(selector) {
  return scoped(selector)
  // perform focusable validation
    .validate(
      'focusable',
      'Failed to focus %s: %e'
    )
  // invoke the native DOM mathod
    .do(element => {
      element.focus();
    });
}
