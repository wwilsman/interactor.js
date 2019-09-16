import computed from '../helpers/computed';
import { q, eq } from '../utils/string';

export default function text(selector) {
  return computed(
    selector,
    element => element.innerText,
    (actual, expected) => ({
      result: eq(actual, expected),
      message: result => result
        ? `%s text is ${q(expected)}`
        : `%s text is ${q(actual)} but expected ${q(expected)}`
    })
  );
}
