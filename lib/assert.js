import Assertion from './assertion.js';
import Context from './context.js';

import chainable from './chainable.js';
import interact from './interact.js';

export class Assert {
  static Symbol = Symbol('@@interactor|assert');

  /** @typedef {import('./assertion').AssertSubject} AssertSubject */
  /** @typedef {import('./assertion').AssertFunction} AssertFunction */
  /** @typedef {import('./assertion').AssertMessage} AssertMessage */
  /** @typedef {import('./assertion').AssertObject<AssertFunction>} AssertObject */

  /**
   * @overload
   * @param {string} name
   * @param {((new (...args: any[]) => Assertion) | AssertObject | AssertFunction)} assertion
   * @returns {typeof Assert}
   */

  /**
   * @overload
   * @param {string} name
   * @param {AssertFunction} assertion
   * @param {AssertMessage} [failureMessage]
   * @param {AssertMessage} [negatedMessage]
   * @returns {typeof Assert}
   */
  static defineAssertion(name, assertion, failureMessage, negatedMessage) {
    if (typeof assertion === 'object' &&
        Object.getPrototypeOf(assertion) === Object.prototype)
      ({ assertion, failureMessage, negatedMessage } = assertion);

    Object.defineProperty(this.prototype, name, {
      configurable: true,

      value: Object.defineProperty(function(...args) {
        let { i, ...context } = this[Assert.Symbol];

        let assert = assertion.prototype instanceof Assertion
          ? new assertion(...args) // eslint-disable-line new-cap
          : new i.constructor.Assertion(function() {
            return assertion.apply(this, args);
          }, failureMessage, negatedMessage);

        Object.assign(assert[Context.Symbol], context);
        return chainable(assert, i, interact);
      }, 'name', { value: name })
    });

    return this;
  }

  /**
   * @param {{ [name: string]: (new (...args: any[]) => Assertion) | AssertObject | AssertFunction }} assertions
   * @returns {typeof Assert}
   */
  static defineAssertions(assertions) {
    for (let name in assertions)
      this.defineAssertion(name, assertions[name]);
    return this;
  }

  /** @typedef {import('./interactor').Interactor} Interactor */

  /**
   * @template [T = {}]
   * @typedef {import('./context').ContextOptions<T>} ContextOptions
   */

  /**
   * @param {Interactor} i
   * @param {ContextOptions} [context]
   */
  constructor(i, context) {
    Object.defineProperty(this, Assert.Symbol, {
      value: { i, ...context, assert: { expected: true, ...context?.assert } },
      enumerable: false
    });
  }

  /**
   * @template T, TChain
   * @typedef {import('./chainable').Chainable<T, TChain>} Chainable<T, TChain>
   */

  /**
   * @type {(((
   *   assertion: AssertSubject | typeof Assertion,
   *   negatedMessage: AssertMessage
   * ) => Chainable<Assertion, Interactor>) & this)}
   */
  get not() {
    let { i, assert, ...context } = this[Assert.Symbol];
    if (!assert.expected) throw new Error('Double negative');
    context = { ...context, assert: { expected: false, ...context.assert } };

    return Object.setPrototypeOf(Object.defineProperty((
      typeof this === 'function' ? function not(assertion, negatedMessage) {
        let assert = !(assertion instanceof Assertion)
          ? new i.constructor.Assertion(assertion, null, negatedMessage)
          : assertion;

        return chainable(Object.setPrototypeOf({
          [Context.Symbol]: { ...assert[Context.Symbol], ...context }
        }, assert), i, interact);
      } : {}
    ), Assert.Symbol, {
      value: { i, ...context },
      enumerable: false
    }), this);
  }
}

export default Assert;
