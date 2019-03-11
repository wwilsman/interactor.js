import computed from '../helpers/computed';
import method from '../helpers/matches';

export default function matches(selector, match) {
  return computed(function() {
    return method.call(this, selector, match);
  });
}
