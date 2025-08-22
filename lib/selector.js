const SelectorRE = /^(?:(?:"(?<str>.*)"\s*)?(?:\$\((?<sel>.*)\)|::(?<test>(?!\()\S+?)?(?:\((?<tval>.*)\))?)?|(?<text>(?!\$|:|").*))$/;
const TestAttrOpRE = /^(?:([~|^$*])?=?(?:(["']?)(.*)\2))?/;

/**
 * @param {HTMLElement} $
 */
function findRelatedElement($) {
  let $label = 'control' in $ ? $ : $.closest('label');
  if ($label === $ || $label?.innerText.startsWith($.innerText))
    return $label.control ?? $label;
  return $;
}

/**
 * @typedef {(string | RegExp | HTMLElement | {
 *   (options: { $root?: HTMLElement, $origin?: HTMLElement }): HTMLElement | HTMLElement[]
 * })} SelectorInput
 */

export class Selector {
  static parse(selector) {
    if (selector instanceof RegExp)
      return { re: selector, string: selector.toString() };

    if (typeof selector === 'function') {
      let string = selector.toString !== Function.toString ? selector.toString() : null;
      return { fn: selector, string };
    }

    if (typeof selector === 'object' && 'ownerDocument' in selector &&
      selector instanceof selector.ownerDocument.defaultView.HTMLElement) {
      let string = `${selector.tagName.toLowerCase()} element`;
      return { $: selector, string };
    }

    if (typeof selector === 'string') {
      let groups = SelectorRE.exec(selector)?.groups;
      if (!groups) throw new Error(`Invalid selector: ${selector}`);
      let { str, sel, test, tval, text = str } = groups;

      test &&= `-${test}`;
      tval &&= tval.replace(TestAttrOpRE, '$1="$3"');
      if (test || tval) sel = `[data-test${test ?? ''}${tval ?? ''}]`;

      let string = !str && text ? `"${text}"` : selector;
      return { sel, text, string };
    }
  }

  #root;
  #origin;
  #parsed;

  /**
   * @param {Object} options
   * @param {SelectorInput} [options.selector]
   * @param {Selector | (() => HTMLElement)} [options.root]
   * @param {Selector | (() => HTMLElement)} [options.origin]
   */
  constructor({ selector, root, origin = root }) {
    this.#root = root;
    this.#origin = origin;
    this.#parsed = Selector.parse(selector);
  }

  root() {
    if (this.#root instanceof Selector)
      return this.#root.query();
    return this.#root?.();
  }

  origin() {
    if (this.#origin instanceof Selector)
      return this.#origin.query();
    return this.#origin?.();
  }

  *traverse() {
    let $root = this.root();
    let $origin = this.origin();
    let { sel, text, re, fn, $ } = this.#parsed ?? {};

    if (fn) return yield fn({ $root, $origin });
    if (!(sel || text || re)) return yield $ ?? $origin;

    return yield* (function* traverse({ $root, $ }) {
      $ = $.firstElementChild || (function next($) {
        if (!$ || $ === $root) return null;
        if ($.nextElementSibling) return $.nextElementSibling;
        return next($.parentElement);
      }($));

      /** @param {HTMLElement & { placeholder?: string }} $ */
      let matches = $ => $ && $ !== $root &&
        (!sel || $.matches(sel)) &&
        (!text || ($.innerText || $.placeholder) === text) &&
        (!re || re.test($.innerText || $.placeholder || ''));
      let match = matches($) && !matches($.firstElementChild);
      if (match && !sel) $ = findRelatedElement($);
      if (match) yield $;
      if (!$) return;

      return yield* traverse({ $root, $ });
    })({ $root, $: $origin });
  }

  query({ strict = true } = {}) {
    let [result] = this.traverse();
    if (strict && !result)
      throw new Error(`Could not find ${this}`);
    return result ?? null;
  }

  queryAll() {
    let [...results] = this.traverse();
    return results;
  }

  toString() {
    return (this.#parsed
      ? this.#parsed.string
      : Selector.parse(this.#origin).string
    ) ?? 'element';
  }
}

export default Selector;
