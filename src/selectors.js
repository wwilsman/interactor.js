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

// Selector creator for nth-child or nth-of-type
export function nth(n, selector, of = 'child') {
  return assign(($node, multiple) => {
    let sel = `${selector}:nth-${of}(${n})`;

    return multiple
      ? $node.querySelectorAll(sel)
      : $node.querySelector(sel);
  }, {
    toString: () => {
      if (!/^\d+$/.test(n)) return `the nth(${n}) ${selector} ${of}`;
      let teen = Array.from(`${n}`).reverse()[1] === '1';
      let th = (!teen && ['', 'st', 'nd', 'rd'][n % 10]) || 'th';
      return `the ${n}${th} ${selector} ${of}`;
    }
  });
}
