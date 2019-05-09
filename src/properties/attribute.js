import computed from '../helpers/computed';
import method, { args } from '../helpers/attribute';
import { validate } from '../assertions/attribute';

export default function attribute() {
  let [selector, attr] = args(arguments);

  return computed(function() {
    return method.call(this, selector, attr);
  }, validate(selector, attr));
}
