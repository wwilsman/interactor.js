import { createSelectorFunction } from './selector.js';

/**
 * @template {{ [key: string]: any }} [T = {}]
 * @typedef {(
 *   (context: IContext<T>) => ContextYield<T>
 * )} ContextFunction
 */

/**
 * @template {{ [key: string]: any }} [T = {}]
 * @typedef {(
 *   string | number | boolean |
 *   any[] | { [key: string]: any } |
 *   undefined | null | void |
 *   ContextGenerator<T> | ContextFunction<T>
 * )} ContextYield
 */

/**
 * @template {{ [key: string]: any }} [T = {}]
 * @typedef {(
 *   Generator<ContextYield<T>, ContextYield<T>, any>
 * )} ContextGenerator
 */

/**
 * @template {{ [key: string]: any }} [T = {}]
 * @typedef {T & {
 *   root?: () => HTMLElement
 *   timeout?: number
 *   frequency?: number
 *   reliability?: number
 *   selector?: import('./selector').Selector
 *   immediate?: ContextOptions<T>
 * }} ContextOptions
 */

/**
 * @template {{ [key: string]: any }} [T = {}]
 * @typedef {Context<T> & T} IContext
 */

/**
 * @template {{ [key: string]: any }} [T = {}]
 */
export class Context {
  static Symbol = Symbol('@@interactor|context');

  /** @typedef {import('./interactor').Interactor} Interactor */

  /**
   * @overload
   * @param {Context<T>} i
   */

  /**
   * @overload
   * @param {Interactor} i
   * @param {ContextOptions<T>} [options]
   */
  constructor(i, options) {
    if (i instanceof Context) {
      return Object.assign(Object.setPrototypeOf(this, i), {
        assert: Object.setPrototypeOf({}, i.assert),
        immediate: i
      });
    }

    let { root, ...rest } = options ?? {};

    Object.defineProperty(this, 'i', {
      /** @type {Interactor} */
      value: this.i = i
    });

    Object.defineProperty(this, 'root', {
      /** @type {() => HTMLElement} */
      value: this.root = Object.assign(() => (
        typeof root !== 'function'
          ? root ?? globalThis.document.body
          : root()
      ), { toString: () => 'root element' })
    });

    this.assert = {
      /** @type {number} */
      timeout: 1000,
      /** @type {number} */
      frequency: 60,
      /** @type {number} */
      reliability: 1
    };

    this.immediate = this;

    this.set(rest);
  }

  /** @type {import('./selector').SelectorFunction} */
  get selector() {
    return Object.assign(
      options => options?.all ? [this.root()] : this.root(),
      { toString: this.root.toString }
    );
  }

  /** @param {import('./selector').Selector} selector */
  set selector(selector) {
    let { set } = Object.getOwnPropertyDescriptor(this.constructor.prototype, 'selector');
    let selectorFn = createSelectorFunction(this, selector);

    Object.defineProperty(this, 'selector', {
      configurable: true,
      get: () => selectorFn,
      set
    });
  }

  /** @type {HTMLElement} */
  get $() {
    return this.selector();
  }

  /** @type {HTMLElement[]} */
  get $$() {
    return this.selector({ all: true });
  }

  /** @type {(options: ContextOptions<T>) => this} */
  /** @this {this & { immediate?: IContext<T> }} */
  get set() {
    return ({ immediate, assert, ...rest }) => {
      if (immediate) Object.assign(this.immediate, immediate);
      if (assert) Object.assign(this.assert, assert);
      return Object.assign(this, rest);
    };
  }
}

export default Context;
