import method from '../helpers/attribute';

export function validate(attr) {
  return (actual, expected) => ({
    result: actual === expected,
    message: () => (
      actual === expected
        ? `"${attr}" is "${expected}"`
        : `"${attr}" is "${actual}" but expected "${expected}"`
    )
  });
}

export default function attribute(attr, value) {
  let actual = method.call(this, attr);
  return validate(attr)(actual, value);
};
