import method from '../helpers/attribute';

export default function attribute(attr, value) {
  let actual = method.call(this, attr);
  let result = actual === value;

  return {
    result,
    message: () => (
      result
        ? `"${attr}" is "${value}"`
        : `"${attr}" is "${actual}" not "${value}"`
    )
  };
};
