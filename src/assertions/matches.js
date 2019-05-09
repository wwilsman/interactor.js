import method, { args } from '../helpers/matches';
import { sel } from '../utils/string';

export function validate(selector, match) {
  return actual => ({
    result: actual,
    message: sel(selector, () => (
      `%s ${actual ? 'matches' : 'does not match'} "${match}"`
    ))
  });
}

export default function matches() {
  let [selector, match] = args(arguments);
  let actual = method.call(this, selector, match);
  return validate(selector, match)(actual);
};
