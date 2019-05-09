import computed from '../helpers/computed';
import method from '../helpers/property';
import { validate } from '../assertions/property';

export default function property(selector, prop) {
  return computed(
    function() {
      return method.call(this, selector, prop);
    },
    validate(prop || selector)
  );
}
