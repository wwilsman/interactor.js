import method from '../helpers/property';
import { q } from '../utils/string';

export default function property(selector, prop, value) {
  if (!value) {
    value = prop;
    prop = selector;
    selector = null;
  }

  let actual = method.call(
    selector ? this.scoped(selector) : this,
    prop
  );

  let result = actual === value;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" property ` : '') + (
        result
          ? q`${prop} is ${value}`
          : q`${prop} is ${actual} not ${value}`
      )
    )
  };
};
