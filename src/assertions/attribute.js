import method, { args } from '../helpers/attribute';
import { sel, q, eq } from '../utils/string';

export function validate(selector, attr) {
  return (actual, expected) => ({
    result: eq(actual, expected),
    message: sel(selector, result => (
      result
        ? `%s "${attr}" is ${q(expected)}`
        : `%s "${attr}" is ${q(actual)} but expected ${q(expected)}`
    ))
  });
}

export default function attribute(...a) {
  let value = a.pop();
  let [selector, attr] = args(a);
  let actual = method.call(this, selector, attr);
  return validate(selector, attr)(actual, value);
};
