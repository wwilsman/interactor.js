import computed from '../helpers/computed';
import method, { args } from '../helpers/property';
import { validate } from '../assertions/property';

export default function property() {
  let [selector, prop] = args(arguments);

  return computed(function() {
    return method.call(this, selector, prop);
  }, validate(selector, prop));
}
