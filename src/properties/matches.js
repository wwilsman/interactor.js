import computed from '../helpers/computed';
import method from '../helpers/matches';
import { validate } from '../assertions/matches';

export default function matches(selector, match) {
  return computed(
    function() {
      return method.call(this, selector, match);
    },
    validate(match || selector)
  );
}
