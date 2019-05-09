import method from '../helpers/property';

function q(value) {
  return typeof value === 'string' ? `"${value}"` : value;
}

export function validate(prop) {
  return (actual, expected) => ({
    result: actual === expected,
    message: () => (
      actual === expected
        ? `"${prop}" is ${q(expected)}`
        : `"${prop}" is ${q(actual)} but expected ${q(expected)}`
    )
  });
}

export default function property(prop, value) {
  let actual = method.call(this, prop);
  return validate(prop)(actual, value);
};
