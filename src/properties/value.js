import computed from '../helpers/computed';
import { q, eq } from '../utils/string';

export default function value(selector) {
  return computed(
    selector,
    element => element.value,
    (actual, expected) => ({
      result: eq(actual, expected),
      message: result => result
        ? `%s value is ${q(expected)}`
        : `%s value is ${q(actual)} but expected ${q(expected)}`
    })
  );
}
