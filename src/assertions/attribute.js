import method from '../helpers/attribute';
import { q } from '../utils/string';

export default function attribute(attr, value) {
  let actual = method.call(this, attr);
  let result = actual === value;

  return {
    result,
    message: () => (
      result
        ? q`${attr} is ${value}`
        : q`${attr} is ${actual} not ${value}`
    )
  };
};
