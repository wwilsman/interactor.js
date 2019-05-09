import computed from '../helpers/computed';

export default function value(selector) {
  return computed(
    selector,
    element => element.value,
    (actual, expected) => ({
      result: actual === expected,
      message: () => (
        actual === expected
          ? `value is "${expected}"`
          : `value is "${actual}" but expected "${expected}"`
      )
    })
  );
}
