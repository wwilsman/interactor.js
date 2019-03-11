import computed from '../helpers/computed';
import method from '../helpers/attribute';

export default function attribute(selector, attr) {
  return computed(function() {
    return method.call(this, selector, attr);
  });
}
