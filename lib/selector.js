const SelectorRE = /^(?:(?:"(?<str>.*)"\s*)?(?:\$\((?<sel>.*)\)|::(?<test>(?!\()\S+?)?(?:\((?<tval>.*)\))?)?|(?<text>(?!\$|:|").*))$/;
const TestAttrOpRE = /^(?:([~|^$*])?=?(?:(["']?)(.*)\2))?/;

function selectRelatedElement($) {
  /* istanbul ignore else: sanity check - it _should_ be impossible for an input to be here */
  if ($.tagName.toLowerCase() !== 'input') {
    let label = 'control' in $ ? $ : $.closest('label');
    if (label === $ || label?.innerText.startsWith($.innerText))
      return label.control ?? label;
  }

  return $;
}

/**
 * @typedef {(string | HTMLElement | {
 *   <T extends boolean | HTMLElement[]>(options: { all: T, root?: HTMLElement, $?: HTMLElement }):
 *     T extends true ? (HTMLElement | HTMLElement[] | null) : (HTMLElement | null)
 * })} Selector
 */

/**
 * @typedef {{
 *   <T extends boolean = false>(options?: { all?: T }):
 *     T extends true ? HTMLElement[] : HTMLElement
 *   (options?: { all?: boolean }): HTMLElement[] | HTMLElement
 * }} SelectorFunction
 */

/**
 * @param {import('./context').Context} context
 * @param {Selector} [selector]
 * @returns {SelectorFunction}
 */
export function createSelectorFunction(context, selector) {
  /* istanbul ignore if: sanity check */
  if (!selector) return context.selector;

  let ctx = { root: context.root, selector: context.selector };
  let selectorFn = typeof selector === 'function' ? selector : null;
  let parsed = typeof selector === 'string' ? SelectorRE.exec(selector)?.groups : {};
  if (!parsed) throw new Error(`Invalid selector: ${selector}`);
  let { str, sel, test, tval, text = str } = parsed;

  // @todo: support testid attribute - `testAttributePrefix`?
  test &&= `-${test}`;
  tval &&= tval.replace(TestAttrOpRE, '$1="$3"');
  if (test || tval) sel = `[data-test${test ?? ''}${tval ?? ''}]`;
  if (text && !str) selector = `"${text}"`;

  let traverseDOM = ({ all, root, $ }) => {
    $ = $.firstElementChild || (function next($) {
      if (!$ || $ === root) return null;
      if ($.nextElementSibling) return $.nextElementSibling;
      return next($.parentElement);
    }($));

    if (all === true) all = [];
    if (!$) return all || undefined;

    // @todo: explore looking at textnodes? considered partial match? optional?
    let matches = $ => $ &&
      $ !== root && (!sel || $.matches(sel)) &&
      (!text || $.innerText === text || $.placeholder === text);
    let match = matches($) &&
      !matches($.firstElementChild);

    if (match && !all) return $;
    if (match && all) all = all.concat($);
    return traverseDOM({ all, root, $ });
  };

  let toString = () => {
    if (selector instanceof context.root().ownerDocument.defaultView.HTMLElement)
      return `${selector.tagName?.toLowerCase()} element`;
    if (typeof selector !== 'function' || selector.toString !== Function.toString)
      return selector.toString();
    return 'element';
  };

  return Object.assign(function select({ all = false } = {}) {
    let root = ctx.root();

    let result = selector instanceof root.ownerDocument.defaultView.HTMLElement
      ? selector : (selectorFn ?? traverseDOM)({ all, root, $: ctx.selector() });
    if (!result) throw new Error(`Could not find ${toString()}`);

    return (typeof selector !== 'string' || sel || !result) ? result : (all
      ? [].concat(result).map(selectRelatedElement)
      : selectRelatedElement(result));
  }, { toString });
}
