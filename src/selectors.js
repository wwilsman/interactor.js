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
export function text(string, selector = '*') {
  return assign(($node, multiple) => {
    let result;

    for (let $el of $node.querySelectorAll(selector)) {
      let text = $el.innerText ?? $el.textContent;

      // if no string, return all selector matches or the first one
      if (!string || text === string) {
        if (multiple) {
          result = (result || []).concat($el);
        } else {
          return $el;
        }
      }
    }

    return result;
  }, {
    toString: () => `"${string}"`
  });
}

// Selector creator for nth-child, nth-last-child, nth-of-type, and nth-last-of-type
export function nth(n, selector, of = 'child') {
  let isInt = Number.isInteger(n);
  let last = isInt && n < 0;

  if (last) {
    of = `last-${of}`;
    n = Math.abs(n);
  }

  return assign(($node, multiple) => {
    let sel = n != null
      ? `${selector}:nth-${of}(${n})`
      : selector;

    return multiple
      ? $node.querySelectorAll(sel)
      : $node.querySelector(sel);
  }, {
    toString: () => {
      if (n == null) return selector;
      if (!isInt) return `the nth(${n}) ${selector}`;
      if (last && n === 1) return `the last ${selector}`;
      let teen = Array.from(`${n}`).reverse()[1] === '1';
      let th = (!teen && ['', 'st', 'nd', 'rd'][n % 10]) || 'th';
      return `the ${n}${th} ${last ? 'last' : ''} ${selector}`;
    }
  });
}
