import Assert from './assert.js';
import Assertion from './assertion.js';
import Context from './context.js';
import Interaction from './interaction.js';
import Arrangement from './arrangement.js';

import chainable from './chainable.js';
import interact from './interact.js';

export class Interactor {
  static Assert = Assert;
  static Assertion = Assertion;
  static Context = Context;
  static Interaction = Interaction;

  /**
   * @param {string} name
   * @param {(
   *   (new (...args: any) => Interaction) |
   *   ((...args: any) => import('./context').ContextYield)
   * )} action
   * @returns {typeof Interactor}
   */
  static defineAction(name, action) {
    Object.defineProperty(this.prototype, name, {
      configurable: true,

      value: Object.defineProperty(function(...args) {
        return chainable(action.prototype instanceof this.constructor.Interaction
          // @ts-ignore
          ? new action(...args) // eslint-disable-line new-cap
          : new this.constructor.Interaction(function() {
            return action.apply(this, args);
          }), this, interact);
      }, 'name', { value: name })
    });

    return this;
  }

  /**
   * @param {{
   *   [name: string]:
   *     (new (...args: any[]) => Interaction) |
   *     ((...args: any[]) => import('./context').ContextYield)
   * }} interactions
   * @returns {typeof Interactor}
   */
  static defineActions(interactions) {
    for (let name in interactions)
      this.defineAction(name, interactions[name]);
    return this;
  }

  /** @typedef {import('./assertion').AssertSubject} AssertSubject */
  /** @typedef {import('./assertion').AssertMessage} AssertMessage */
  /** @typedef {import('./assertion').AssertFunction} AssertFunction */
  /** @typedef {import('./assertion').AssertObject<AssertFunction>} AssertObject */

  /**
   * @overload
   * @param {string} name
   * @param {(
   *   (new (...args: any[]) => Assertion) |
   *   ((...args: any[]) => AssertSubject) |
   *   AssertObject
   * )} assertion
   * @returns {typeof Interactor}
   */

  /**
   * @overload
   * @param {string} name
   * @param {(...args: any[]) => AssertSubject} assertion
   * @param {AssertMessage} [failureMessage]
   * @param {AssertMessage} [negatedMessage]
   * @returns {typeof Interactor}
   */
  static defineAssertion(name, assertion, failureMessage, negatedMessage) {
    this.Assert.defineAssertion(name, assertion, failureMessage, negatedMessage);
    return this;
  }

  /**
   * @param {{
   *   [name: string]:
   *     (new (...args: any[]) => Assertion) |
   *     ((...args: any[]) => AssertSubject) |
   *     AssertObject
   * }} assertions
   * @returns {typeof Interactor}
   */
  static defineAssertions(assertions) {
    this.Assert.defineAssertions(assertions);
    return this;
  }

  /**
   * @param {ConstructorParameters<typeof Context>[1]} [options]
   */
  constructor(options) {
    Object.defineProperties(this, {
      [Context.Symbol]: {
        enumerable: false,
        value: new this.constructor.Context(this, options)
      }
    });
  }

  /**
   * @param {import('./context').ContextFunction} callback
   * @returns {import('./chainable').Chainable<Arrangement, Interactor, any>}
   */
  arrange(callback) {
    return chainable((
      new Arrangement(callback)
    ), this, interact);
  }

  /**
   * @template {(Interaction | import('./context').ContextFunction)} T
   * @param {T} interaction
   * @returns {(
   *   T extends import('./context').ContextFunction<any, infer R> ?
   *     import('./chainable').Chainable<Interaction, Interactor, R> :
   *   T extends Interaction<infer R> ?
   *     import('./chainable').Chainable<T, Interactor, R> :
   *   never
   * )}
   */
  act(interaction) {
    return chainable((
      !(interaction instanceof this.constructor.Interaction)
        ? new this.constructor.Interaction(interaction)
        : interaction
    ), this, interact);
  }

  /**
   * @type {(Assert & (
   *   ((assertion: import('./context').ContextYield, failureMessage?: string) =>
   *     import('./chainable').Chainable<Assertion, Interactor, boolean>) &
   *   (<T extends Assertion>(assertion: T) =>
   *     import('./chainable').Chainable<T, Interactor, boolean>)
   * ))}
   */
  get assert() {
    return Object.setPrototypeOf(
      function assert(assertion, failureMessage) {
        return chainable((
          !(assertion instanceof this.constructor.Assertion)
            ? new this.constructor.Assertion(assertion, failureMessage)
            : assertion
        ), this, interact);
      }, new this.constructor.Assert(this));
  }

  /**
   * @template [T = {}]
   * @typedef {import('./context').ContextOptions<T>} ContextOptions
   */

  /**
   * @param {ContextOptions['selector']} [selector]
   * @returns {import('./chainable').Chainable<Assert & {
   *   times(number: number): import('./chainable').Chainable<Assertion, Interactor, boolean>
   * }, Interactor, HTMLElement>}
   */
  find(selector) {
    let { then: scoped } = chainable(
      Object.defineProperty({}, Interaction.Symbol, {
        enumerable: false,

        value: function find({ set }) {
          if (selector) set({ immediate: { selector } });
        }
      }), this, interact);

    return chainable(
      Object.setPrototypeOf(Object.defineProperty({
        /**
         * @param {number} number
         * @returns {import('./chainable').Chainable<Assertion, Interactor, boolean>}
         */
        times(number) {
          let { i, ...context } = this[Assert.Symbol];

          let assertion = new i.constructor.Assertion(
            ({ $$ }) => $$.length === number,
            `Expected to find #{this} ${number} times`,
            `Expected not to find #{this} ${number} times`
          );

          Object.assign(assertion[Context.Symbol], context);
          return chainable(assertion, scoped, interact);
        }
      }, Interaction.Symbol, {
        enumerable: false,

        value: function* exists() {
          yield this.assert.exists();
          return ({ $ }) => $;
        }
      }), (
        new this.constructor.Assert(scoped)
      )), scoped, interact);
  }
}

export default Interactor;
