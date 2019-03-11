import method from '../helpers/matches';

export default function matches(match) {
  let result = method.call(this, match);

  return {
    result,
    message: () => (
      `is ${result ? '' : 'not '}"${match}"`
    )
  };
};
