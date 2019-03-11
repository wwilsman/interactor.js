import computed from '../helpers/computed';
import method from '../helpers/property';

export default function property(selector, prop) {
  return computed(function() {
    return method.call(this, selector, prop);
  });
}
