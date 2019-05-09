import computed from '../helpers/computed';
import method, { args } from '../helpers/matches';
import { validate } from '../assertions/matches';

export default function matches() {
  let [selector, match] = args(arguments);

  return computed(function() {
    return method.call(this, selector, match);
  }, validate(selector, match));
}
