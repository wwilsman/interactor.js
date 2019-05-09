import computed from '../helpers/computed';
import method from '../helpers/attribute';
import { validate } from '../assertions/attribute';

export default function attribute(selector, attr) {
  return computed(
    function() {
      return method.call(this, selector, attr);
    },
    validate(attr || selector)
  );
}
