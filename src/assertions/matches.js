import method from '../helpers/matches';

export default function matches(selector, match) {
  if (!match) {
    match = selector;
    selector = null;
  }

  let result = method.call(
    selector ? this.scoped(selector) : this,
    match
  );

  return {
    result,
    message: () => (
      (selector ? `"${selector}" ` : '') + (
        `is ${result ? '' : 'not '}"${match}"`
      )
    )
  };
};
