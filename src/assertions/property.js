import method from '../helpers/property';

export default function property(prop, value) {
  let actual = method.call(this, prop);
  let result = actual === value;

  return {
    result,
    message: () => (
      result
        ? `"${prop}" is "${value}"`
        : `"${prop}" is "${actual}" not "${value}"`
    )
  };
};