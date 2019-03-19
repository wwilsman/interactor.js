import method from '../helpers/attribute';
import { q } from '../utils/string';

export default function attribute(selector, attr, value) {
  if (!value) {
    value = attr;
    attr = selector;
    selector = null;
  }

  let actual = method.call(
    selector ? this.scoped(selector) : this,
    attr
  );

  let result = actual === value;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" attribute ` : '') + (
        result
          ? q`${attr} is ${value}`
          : q`${attr} is ${actual} not ${value}`
      )
    )
  };
};
