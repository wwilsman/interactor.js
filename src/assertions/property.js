import method from '../helpers/property';
import { q } from '../utils/string';

export default function property(prop, value) {
  let actual = method.call(this, prop);
  let result = actual === value;

  return {
    result,
    message: () => (
      result
        ? q`${prop} is ${value}`
        : q`${prop} is ${actual} not ${value}`
    )
  };
};
