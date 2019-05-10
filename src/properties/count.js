import computed from '../helpers/computed';
import method from '../helpers/count';
import { validate } from '../assertions/count';

export default function count(selector) {
  return computed(function() {
    return method.call(this, selector);
  }, validate(selector));
}
