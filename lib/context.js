import { createSelectorFunction } from './selector.js';

/**
 * @template {{ [key: string]: any }} [T = {}]
 * @template [TReturn = any]
 * @typedef {(
 *   (context: IContext<T>) => ContextYield<TReturn> | TReturn
 * )} ContextFunction
 */

/**
 * @template [T = any]
 * @template {{ [key: string]: any }} [C = {}]
 * @typedef {(
 *   ContextGenerator<C, T> | ContextFunction<C, T> | T |
 *   string | number | boolean | undefined | null | void |
 *   any[] | { [key: string]: any }
 * )} ContextYield
 */

/**
 * @template {{ [key: string]: any }} [T = {}]
 * @template {any} [TReturn = any]
 * @typedef {(Generator<
 *   ContextYield<TReturn, T>,
 *   ContextYield<TReturn, T>, any
 * >)} ContextGenerator
 */

/**
 * @template {{ [key: string]: any }} [T = {}]
 * @typedef {T & {
 *   root?: () => HTMLElement
 *   selector?: import('./selector').Selector
 *   immediate?: ContextOptions<T>
 *   assert?: {
 *     expected?: boolean
 *     timeout?: number
 *     frequency?: number
 *     reliability?: number
 *   }
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

    /** @type {Object} */
    this.assert = {
      /** @type {number} */
      timeout: 1000,
      /** @type {number} */
      frequency: 60,
      /** @type {number} */
      reliability: 1
    };

    /** @type {this} */
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

  /**
   * @type {(options: ContextOptions<T>) => this}
   */
  get set() {
    // @ts-ignore
    return ({ immediate, assert, ...rest }) => {
      if (immediate) Object.assign(this.immediate, immediate);
      if (assert) Object.assign(this.assert, assert);
      return Object.assign(this, rest);
    };
  }
}

export default Context;
