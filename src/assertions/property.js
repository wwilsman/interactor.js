import method, { args } from '../helpers/property';
import { sel, q } from '../utils/string';

export function validate(selector, prop) {
  return (actual, expected) => ({
    result: actual === expected,
    message: sel(selector, () => (
      actual === expected
        ? `%s "${prop}" is ${q(expected)}`
        : `%s "${prop}" is ${q(actual)} but expected ${q(expected)}`
    ))
  });
}

export default function property(...a) {
  let value = a.pop();
  let [selector, prop] = args(a);
  let actual = method.call(this, selector, prop);
  return validate(selector, prop)(actual, value);
};
