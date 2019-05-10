import method from '../helpers/count';
import { sel } from '../utils/string';

export function validate(selector) {
  return (actual, expected) => ({
    result: actual === expected,
    message: sel(selector, () => (
      actual === expected
        ? `found ${expected} %s elements`
        : `found ${actual} %s elements but expected ${expected}`
    ))
  });
}

export default function count(selector, expected) {
  let actual = method.call(this, selector);
  return validate(selector)(actual, expected);
}
