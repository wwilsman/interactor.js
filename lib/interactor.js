import Assert from './assert.js';
import Assertion from './assertion.js';
import Context from './context.js';
import Interaction from './interaction.js';

import chainable from './chainable.js';
import interact from './interact.js';

export class Interactor {
  static Assert = Assert;
  static Assertion = Assertion;
  static Context = Context;
  static Interaction = Interaction;

  /**
   * @template T, I
   * @typedef {import('./chainable').Chainable<T, I>} Chainable
   */

  /**
   * @template [T = {}]
   * @typedef {import('./context').ContextYield<T>} ContextYield
   */

  /**
   * @param {string} name
   * @param {((new (...args: any[]) => Interaction) | ((...args: any[]) => ContextYield))} action
   * @returns {typeof Interactor}
   */
  static defineAction(name, action) {
    Object.defineProperty(this.prototype, name, {
      configurable: true,

      value: Object.defineProperty(function(...args) {
        return chainable(action.prototype instanceof this.constructor.Interaction
          ? new action(...args) // eslint-disable-line new-cap
          : new this.constructor.Interaction(function() {
            return action.apply(this, args);
          }), this, interact);
      }, 'name', { value: name })
    });

    return this;
  }

  /**
   * @param {{ [name: string]: (new (...args: any[]) => Interaction) | ((...args: any[]) => ContextYield) }} interactions
   * @returns {typeof Interactor}
   */
  static defineActions(interactions) {
    for (let name in interactions)
      this.defineAction(name, interactions[name]);
    return this;
  }

  /** @typedef {import('./assertion').AssertFunction} AssertFunction */
  /** @typedef {import('./assertion').AssertMessage} AssertMessage */
  /** @typedef {import('./assertion').AssertObject<AssertFunction>} AssertObject */

  /**
   * @overload
   * @param {string} name
   * @param {((new (...args: any[]) => Assertion) | AssertObject | AssertFunction)} assertion
   * @returns {typeof Interactor}
   */

  /**
   * @overload
   * @param {string} name
   * @param {AssertFunction} assertion
   * @param {AssertMessage} [failureMessage]
   * @param {AssertMessage} [negatedMessage]
   * @returns {typeof Interactor}
   */
  static defineAssertion(name, assertion, failureMessage, negatedMessage) {
    this.Assert.defineAssertion(name, assertion, failureMessage, negatedMessage);
    return this;
  }

  /**
   * @param {{ [name: string]: (new (...args: any[]) => Assertion) | AssertObject | AssertFunction }} assertions
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
    Object.defineProperty(this, Context.Symbol, {
      value: new this.constructor.Context(this, options),
      enumerable: false
    });
  }

  /**
   * @template {(Interaction | ContextYield)} T
   * @param {T} interaction
   * @returns Chainable<T extends Interaction ? T : Interaction, Interactor>
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
   *   (assertion: Assertion | ContextYield, failureMessage?: string) => Chainable<Assertion, this>
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
   * @returns {Chainable<Assert & {
   *   times(number: number): Chainable<Assert, Interactor>
   * }, Interactor>}
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
        times(number) {
          let { i, ...context } = this[Assert.Symbol];

          let assert = new i.constructor.Assertion(
            ({ $$ }) => $$.length === number,
            `Expected to find #{this} ${number} times`,
            `Expected not to find #{this} ${number} times`
          );

          Object.assign(assert[Context.Symbol], context);
          return chainable(assert, scoped, interact);
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
