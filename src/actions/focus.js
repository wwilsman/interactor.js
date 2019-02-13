import scoped from '../properties/scoped';

export default function focus(selector) {
  return scoped(selector)
  // perform focusable validation
    .validate(
      'focusable',
      'Failed to focus %s: %e'
    )
  // invoke the native DOM method
    .do(element => {
      element.focus();
    });
}
