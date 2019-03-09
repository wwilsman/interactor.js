import scoped from '../helpers/scoped';

export default function blur(selector) {
  return scoped(selector)
  // preform focused validation
    .assert.focused()
    .assert.f('Failed to blur %s: %e')
  // invoke the native DOM method
    .do(element => {
      element.blur();
    });
}
