import scoped from '../helpers/scoped';

export default function click(selector) {
  return scoped(selector)
  // perform clickable validation
    .assert.focusable()
    .assert.not.disabled()
    .assert.f('Failed to click %s: %e')
  // invoke the native DOM method
    .do(element => {
      element.click();
    });
}
