import { Selector } from './selector.js';

/**
 * @template {{}} [T = {}]
 * @template [TReturn = any]
 * @typedef {(
 *   (context: IContext<T>) => ContextYield<TReturn> | TReturn
 * )} ContextFunction
 */

/**
 * @template [T = any]
 * @template {{}} [C = {}]
 * @typedef {(
 *   ContextGenerator<C, T> | ContextFunction<C, T> | T |
 *   string | number | boolean | undefined | null | void |
 *   any[] | { [key: string]: any }
 * )} ContextYield
 */

/**
 * @template {{}} [T = {}]
 * @template {any} [TReturn = any]
 * @typedef {(Generator<
 *   ContextYield<TReturn, T>,
 *   ContextYield<TReturn, T>, any
 * >)} ContextGenerator
 */

/**
 * @template {{}} [T = {}]
 * @typedef {T & {
 *   [key: string]: any
 *   root?: () => HTMLElement
 *   selector?: import('./selector').SelectorInput
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
 * @template {{}} [T = {}]
 * @typedef {Context<T> & T} IContext
 */

/**
 * @template {{}} [T = {}]
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
      ), {
        toString: () => 'root element'
      })
    });

    this.assert = {
      timeout: 1000,
      frequency: 60,
      reliability: 1
    };

    this.immediate = this;
    this.set(rest);
  }

  /** @type {import('./selector').Selector} */
  get selector() {
    return new Selector({
      root: this.root
    });
  }

  /** @param {import('./selector').SelectorInput} selector */
  set selector(selector) {
    let { set } = Object.getOwnPropertyDescriptor(this.constructor.prototype, 'selector');

    let sel = new Selector({
      origin: this.selector,
      root: this.root,
      selector
    });

    Object.defineProperty(this, 'selector', {
      configurable: true,
      get: () => sel,
      set
    });
  }

  /** @type {HTMLElement} */
  get $() {
    return this.selector.query();
  }

  /** @type {HTMLElement[]} */
  get $$() {
    return this.selector.queryAll();
  }

  /** @type {(options: ContextOptions<T>) => this} */
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
