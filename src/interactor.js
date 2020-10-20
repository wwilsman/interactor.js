import InteractorAssert, { assertion } from './assert';
import InteractorError from './error';
import when from './when';
import m from './meta';

import extend, {
  defineInteractorProperties
} from './extend';

import {
  query
} from './dom';

import {
  assign,
  defineProperty,
  defineProperties,
  getPrototypeOf,
  named
} from './utils';

import * as actions from './actions';
import * as properties from './properties';
import * as selectors from './selectors';

/**
 * # Core API
 *
 * Interactors are immutable, with actions and assertions adding callbacks to the next interactor's
 * internal queue which is later run when the interactor is awaited on. The following properties and
 * methods are available on all interactors and can be used to create new interactors with custom
 * behaviors.
 *
 * @namespace Core
 */

/**
 * The base interactor creator sets initial metadata for the interactor instance. When no `selector`
 * is provided, and [`Interactor.selector`](#Interactor.selector) does not return a selector, the
 * interactor will reference the parent interactor's element or the document body if there is no
 * parent interactor. When additional interactor `properties` are provided, an extended instance of
 * the interactor is returned with those additional properties (see [Interactor.extend](#Interactor.extend)).
 *
 * ``` javascript
 * await Interactor('.btn').click();
 * await Interactor('.btn').exec(Interactor().click());
 *
 * const btn = Interactor('.btn', {
 *   doubleClick: () => Interactor().click().click()
 * });
 *
 * await btn.doubleClick();
 * ```
 *
 * @memberof Core
 * @name Interactor
 * @param {String|Function} [selector] - Interactor selector string or function.
 * @param {Object} [properties] - Additional interactor properties.
 * @returns {Interactor}
 */
export default function Interactor(selector, properties) {
  if (properties) {
    return Interactor.extend(properties)(selector);
  } else if (!(this instanceof Interactor)) {
    return new Interactor(selector);
  }

  // initial metadata
  m.set(this, {
    selector: this.constructor.selector(selector),
    timeout: this.constructor.timeout,
    interval: 10,
    keyboard: {},
    queue: [],
    nested: false,
    parent: null,
    top: true
  });

  // lazily create the instance assert property the first time it is invoked
  defineProperty(this, 'assert', {
    configurable: true,
    get: () => {
      let a = InteractorAssert(this);

      defineProperty(this, 'assert', {
        configurable: true,
        value: a
      });

      return a;
    }
  });
}

defineProperties(Interactor, {
  /**
   * When present, the interactor's name will be used in error messages alongside the interactor's
   * selector if also present.
   *
   * ``` javascript
   * const Button = Interactor.extend({ name: 'button' }, { ... });
   * const Link = Interactor.extend({ name: 'link' }, { ... });
   *
   * await Button('.submit').click();
   * // => InteractorError: could not find .submit button
   *
   * await Link(by.text('Home')).click();
   * // => InteractorError: could not find "Home" link
   * ```
   *
   * @memberof Core
   * @name Interactor.name
   * @type {String}
   * @default ""
   */
  name: { writable: true, value: '' },

  /**
   * The default timeout for assertions run by instances of this interactor. The initial value of
   * this property is 2000ms.
   *
   * ``` javascript
   * // assertions made with this interactor will timeout after 500ms
   * const Quick = Interactor.extend({ timeout: 500 }, { ... });
   * ```
   *
   * @memberof Core
   * @name Interactor.timeout
   * @type {Number}
   * @default 2000
   */
  timeout: { writable: true, value: 2000 },

  /**
   * @alias Interactor.Error
   * @readonly
   */
  Error: { value: InteractorError },

  /**
   * @alias Interactor.extend
   * @readonly
   */
  extend: { value: extend },

  /**
   * @alias Interactor.assertion
   * @readonly
   */
  assertion: { value: assertion },

  /**
   * A function that accepts the selector provided to a new interactor instance and returns a valid
   * interactor selector for that instance.
   *
   * @memberof Core
   * @name Interactor.selector
   * @type {Function}
   * @default s => s
   */
  selector: {
    configurable: true,
    get: () => s => s,
    set: function setSelectorFn(selector) {
      defineProperty(this, 'selector', {
        configurable: true,
        get: () => typeof selector === 'string'
          ? s => s ?? selector : selector,
        set: setSelectorFn
      });
    }
  },

  /**
   * The DOM object being interacted with.
   *
   * @memberof Core
   * @name Interactor.dom
   * @type {Object}
   * @default window
   */
  dom: {
    configurable: true,
    get: () => window,
    set: function setDOM(win) {
      defineProperty(this, 'dom', {
        configurable: true,
        get: typeof win === 'function'
          ? win : () => win,
        set: setDOM
      });
    }
  },

  /**
   * Suppresses the layout engine warning.
   *
   * @memberof Core
   * @name Interactor.suppressLayoutEngineWarning
   * @type {Boolean}
   * @default false
   */
  suppressLayoutEngineWarning: {
    configurable: true,
    get: function() {
      return !!getPrototypeOf(this).constructor
        .suppressLayoutEngineWarning;
    },
    set: function suppressLayoutEngineWarning(bool) {
      defineProperty(this, 'suppressLayoutEngineWarning', {
        configurable: true,
        get: () => !!bool,
        set: suppressLayoutEngineWarning
      });
    }
  },

  /**
   * Create a nested interactor.
   *
   * @memberof Core
   * @name Interactor.find
   * @type {Function}
   */
  find: {
    value: assign(function find(selector) {
      return m.new(Interactor(selector), 'nested', true);
    }, selectors)
  }
});

assign(Interactor.prototype, {
  /**
   * Returns a child element or the interactor element when no selector is provided. Throws when the
   * element or parent element cannot be found.
   *
   * @memberof Core
   * @name Interactor#$
   * @param {String|Function} [selector] - Interactor selector string or function.
   * @returns {Element} The found child element or root element when no selector is provided.
   */
  $(selector) {
    return query.call(this, selector);
  },

  /**
   * Returns an array of child elements. Throws an error when no selector is provided or when the
   * parent element cannot be found. Returns an empty array when no child elements are found.
   *
   * @memberof Core
   * @name Interactor#$$
   * @param {String|Function} selector - Interactor selector string or function.
   * @returns {Element[]} The found child elements within the root element.
   */
  $$(selector) {
    return query.call(this, selector, true);
  },

  /**
   * Retreives or sets the topmost interactor's assertion timeout.
   *
   * @memberof Core
   * @name Interactor#timeout
   * @param {Number} [ms] - Interactor assertion timeout, in milliseconds.
   * @returns {(Number|Interactor)} The topmost interactor timeout or a new interactor instance with
   * the specified timeout when one is provided.
   */
  timeout(ms) {
    return ms
      ? m.new(m.top(this), 'timeout', ms)
      : m.get(m.top(this), 'timeout');
  },

  /**
   * Returns a child interactor instance referencing the selector. The child interactor's methods
   * will return the topmost interactor unless returning a further nested child interactor. When an
   * interactor instance is provided, a new child instance of it will be returned with the current
   * interactor attached as its parent.
   *
   * @memberof Core
   * @name Interactor#find
   * @param {String|Function|Interactor} selector - A selector string or function, or an interactor.
   * @returns {Interactor} A nested child interactor instance.
   */
  find(selector) {
    let q = m.get(selector, 'queue');
    let i = q ? selector : Interactor(selector);

    if ((q || m.get(i, 'queue')).length) {
      throw InteractorError(
        'the provided interactor must not have queued actions'
      );
    }

    return m.set(m.new(i, 'parent', this), 'nested', true);
  },

  /**
   * Adds an assertion to the next interactor instance's queue. Sequential assertions will be
   * grouped together and run at the same time. When running, assertions will be retried if they
   * throw an error until the interactor's timeout has passed. If the provided assertion defines an
   * argument, the interactor's element will be provided as that argument.
   *
   * @memberof Core
   * @name Interactor#assert
   * @param {Function} assertion - The assertion function to add to the interactor queue.
   * @returns {Interactor} A new interactor instance with the assertion added to its queue.
   */
  assert(assertion) {
    return m.new(m.top(this), 'queue', {
      type: 'assert',
      fn: assertion,
      ctx: this
    });
  },

  /**
   * Adds a callback to the next interactor instance's queue. If an interactor with an existing
   * queue is provided, that queue is appended to the next topmost interactor queue and the next
   * topmost interactor instance is returned.
   *
   * @memberof Core
   * @name Interactor#exec
   * @param {Function|Interactor} callback - The callback function to add to the interactor queue or
   * another interactor with an existing queue.
   * @returns {Interactor} A new interactor instance with the callback added to its queue or
   * appended with the provided interactor's queue.
   */
  exec(callback) {
    if (m.get(callback, 'queue')) {
      let { queue, keyboard } = m.get(callback);

      queue = queue.map(a => assign({}, a, {
        ctx: m.new(a.ctx, 'parent', this)
      }));

      return m.new(m.top(this), { keyboard, queue });
    } else {
      return m.new(m.top(this), 'queue', {
        type: 'exec',
        fn: callback,
        ctx: this
      });
    }
  },

  /**
   * Adds an error handler to the next interactor instance's queue. When a string is provided, the
   * substring "%{e}" will be replaced with the thrown error message.
   *
   * @memberof Core
   * @name Interactor#catch
   * @param {Function|String} handler - The error handler or an error message string.
   * @returns {Interactor} A new interactor instance with the handler added to its queue.
   */
  catch(handler) {
    if (typeof handler === 'string') {
      let message = handler;

      handler = err => {
        if (err.name === 'InteractorError') {
          throw err.format(message);
        } else {
          throw err;
        }
      };
    }

    return m.new(m.top(this), 'queue', {
      type: 'catch',
      fn: handler,
      ctx: this
    });
  },

  /**
   * Starts processing the interactor instance's queue and returns a promise, allowing interactors
   * to be used with the async/await syntax. Queued functions are bound to the instance it was
   * called within. Sequential assertions are pushed to a deferred function that is then called
   * before the next queued function that is not an assertion. Functions that throw interactor
   * errors are formatted with the current interactor instance.
   *
   * @memberof Core
   * @name Interactor#then
   * @param {Function} [onFulfilled] - Passed along to the resulting Promise#then method.
   * @param {Function} [onRejected] - Passed along to the resulting Promise#then method.
   * @returns {Promise} A promise that resolves once all queued functions have run.
   */
  then() {
    let { queue, timeout, interval } = m.get(this);
    let assertion;

    return queue.reduce((promise, action, i) => {
      let { type, ctx, fn } = action;
      if (!fn) type = null;

      // bind the action to its associated instance and call any additional function beforehand; if
      // the action requires an argument, the interactor instance element is provided
      let bind$ = (fn, f) => named(fn.name, () => {
        if (f) f();

        return fn.length
          ? fn.call(ctx, ctx.$())
          : fn.call(ctx);
      });

      // format any thrown interactor errors
      let onError = err => {
        throw err.name === 'InteractorError'
          ? err.bind(ctx)
          : err;
      };

      // track assertions
      if (type === 'assert') {
        assertion = bind$(fn, assertion);
      }

      // execute and clear assertions within a convergence
      if (assertion && (type !== 'assert' || i === queue.length - 1)) {
        promise = promise.then(
          when(assertion, {
            remains: action.remains,
            interval,
            timeout
          })
        ).catch(onError);

        assertion = null;
      }

      if (type === 'exec') {
        promise = promise.then(bind$(fn)).catch(onError);
      } else if (type === 'catch') {
        promise = promise.catch(fn.bind(ctx));
      }

      return promise;
    }, Promise.resolve()).then(...arguments);
  },

  /**
   * Returns a string representation of the interactor using its selector and any parent.
   *
   * @memberof Core
   * @name Interactor#toString
   * @returns {String} - A string representation of the interactor.
   */
  toString() {
    let name = this.constructor.name;
    let { parent, selector } = m.get(this);
    let string = selector?.toString() || '';

    if (name) string += ` ${name}`;
    if (parent && m.get(parent, 'selector')) {
      string += `${string && ' within '}${parent}`;
    }

    return string;
  }
});

// define built-in actions and properties
defineInteractorProperties(
  Interactor.prototype,
  assign({}, actions, properties)
);
