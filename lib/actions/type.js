import Interaction from '../interaction';
import Context from '../context';

/**
 * @param {string} string
 * @param {Object} [options]
 * @param {number} [options.delay]
 * @param {boolean} [options.replace]
 * @param {(number | [number, number])} [options.range]
 * @returns {import('../context').ContextGenerator}
 */
export function* type(string, options) {
  yield this.focus();

  for (let i = 0; i < string.length; i++) {
    yield this.press(string[i], options);

    if (options?.delay && i < string.length - 1)
      yield new Promise(r => setTimeout(r, options?.delay));
  }

  if (yield ({ $ }) => (/input|textarea/i).test($.tagName))
    yield this.trigger('change', { cancelable: false });

  yield this.blur();
}

export class TypeAction extends Interaction {
  /** @param {Parameters<type>} args */
  constructor(...args) {
    super(({ i }) => type.apply(i, args));
  }

  /** @param {import('../context').ContextOptions['selector']} selector */
  into(selector) {
    this[Context.Symbol].selector = selector;
    return this;
  }
}

export default TypeAction;
