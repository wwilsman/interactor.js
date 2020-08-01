import { assign } from './utils';

// Selector creator using an xpath selector.
export function xpath(path) {
  return assign(($node, multiple) => {
    let result = document.evaluate(path, $node, null, multiple ? 5 : 9, null);
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
    toString: () => `xpath(${path})`
  });
}

// Selector creator using an element's text.
export function text(string, xsel = '*') {
  return assign((
    xpath(`.//${xsel}[normalize-space()="${string}"]`)
  ), {
    toString: () => `"${string}"`
  });
}
