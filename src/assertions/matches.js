import method from '../helpers/matches';

export function validate(match) {
  return actual => ({
    result: actual,
    message: () => (
      `${actual ? 'matches' : 'does not match'} "${match}"`
    )
  });
}

export default function matches(match) {
  let actual = method.call(this, match);
  return validate(match)(actual);
};
