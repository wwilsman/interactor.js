import computed from '../helpers/computed';

export default function text(selector) {
  return computed(
    selector,
    element => element.innerText,
    (actual, expected) => ({
      result: actual === expected,
      message: () => (
        actual === expected
          ? `%s text is "${expected}"`
          : `%s text is "${actual}" but expected "${expected}"`
      )
    })
  );
}
