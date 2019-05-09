import computed from '../helpers/computed';

export default function text(selector) {
  return computed(
    selector,
    element => element.innerText,
    (actual, expected) => ({
      result: actual === expected,
      message: () => (
        actual === expected
          ? `text is "${expected}"`
          : `text is "${actual}" but expected "${expected}"`
      )
    })
  );
}
