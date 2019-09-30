import computed from '../helpers/computed';
import { hasLayoutEngine } from '../utils/dom';
import { q, eq } from '../utils/string';

export default function text(selector) {
  return computed(
    selector,
    function(element) {
      return hasLayoutEngine.call(this, (
        'The appearance of text as a result of CSS cannot be determined ' +
          '(such as pseudo content and text transformations)'
      ))
        ? element.innerText
        : element.textContent;
    },
    (actual, expected) => ({
      result: eq(actual, expected),
      message: result => result
        ? `%s text is ${q(expected)}`
        : `%s text is ${q(actual)} but expected ${q(expected)}`
    })
  );
}
