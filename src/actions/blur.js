import scoped from '../properties/scoped';

export default function blur(selector) {
  return scoped(selector)
  // preform focused validation
    .validate(
      'focused',
      'Failed to blur %s: %e'
    )
  // invoke the native DOM method
    .do(element => {
      element.blur();
    });
}
