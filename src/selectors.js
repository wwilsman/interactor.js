import { assign } from './utils';

// Selector creator using an xpath selector.
export function x(xpath) {
  return assign(($node, multiple) => {
    let result = document.evaluate(xpath, $node, null, multiple ? 5 : 9, null);
    let arr, n;

    if (multiple) {
      arr = [];

      while ((n = result.iterateNext())) {
        arr.push(n);
      }

      return arr;
    }

    return result.singleNodeValue;
  }, {
    toString: () => `x(${xpath})`
  });
}

// Selector creator using an element's text.
export function t(text) {
  return assign((
    x(`.//*[normalize-space()="${text}"]`)
  ), {
    toString: () => `"${text}"`
  });
}
