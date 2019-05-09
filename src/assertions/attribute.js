import method, { args } from '../helpers/attribute';
import { sel } from '../utils/string';

export function validate(selector, attr) {
  return (actual, expected) => ({
    result: actual === expected,
    message: sel(selector, () => (
      actual === expected
        ? `%s "${attr}" is "${expected}"`
        : `%s "${attr}" is "${actual}" but expected "${expected}"`
    ))
  });
}

export default function attribute(...a) {
  let value = a.pop();
  let [selector, attr] = args(a);
  let actual = method.call(this, selector, attr);
  return validate(selector, attr)(actual, value);
};
