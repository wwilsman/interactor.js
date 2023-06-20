import InteractorAssert, { assertion } from './assert.js';
import InteractorError from './error.js';
import when from './when.js';
import m from './meta.js';

import extend, {
  defineInteractorProperties
} from './extend.js';

import {
  query
} from './dom.js';

import {
  assign,
  defineProperty,
  defineProperties,
  getPrototypeOf,
  hasOwn,
  named
} from './utils.js';

import * as actions from './actions.js';
import * as properties from './properties.js';
import * as selectors from './selectors.js';

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
 * is provided, and `I.selector` does not return a selector, the interactor will reference the
 * parent interactor's element or the document body if there is no parent interactor. When
 * additional interactor `properties` are provided, an extended instance of the interactor is
 * returned with those additional properties (see [I.extend](#I.extend([options][,%20properties]))).
 *
 * ``` javascript
 * await I('.btn').click();
 * await I('.btn').exec(I.click());
 *
 * const btn = I('.btn', {
 *   dblClick: () => I.click().click()
 * });
 *
 * await btn.dblClick();
 * ```
 *
 * @memberof Core
 * @name I
 * @param {String|Function} [selector] - Interactor selector string or function.
 * @param {Object} [properties] - Additional interactor properties.
 * @returns {Interactor}
 */
export default function Interactor(selector, properties) {
  if (properties)
    return Interactor.extend(properties)(selector);
  else if (!(this instanceof Interactor))
    return new Interactor(selector);

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
   * Returns a nested interactor instance referencing the selector. The nested interactor can be
   * used as a child within other interactors to select nested child elements within the parent
   * interactor element's DOM.
   *
   * ``` html
   * <p class="a"><span>A</span></p>
   * <p class="b"><span>B</span></p>
   * <p class="c"><span>C</span></p>
   * ```
   *
   * ``` javascript
   * // this span interactor refers to the first span in the document
   * const b = I('.b', { span: I('span') });
   * // this span interactor refers to the first span within the scope
   * const c = I('.c', { span: I.find('span') });
   *
   * await b.assert.span.text('B');
   * //=> InteractorError: span text is "A" but expected "B"
   * await c.assert.not.span.text('C');
   * //=> InteractorError: span within .c text is "C" but expected it not to be
   * ```
   *
   * @memberof Core
   * @name I.find
   * @param {String|Function} selector - A selector string or function.
   * @returns {Interactor} A nested interactor instance.
   */
  find: {
    get: function() {
      return assign(m.set(selector => {
        return m.new(this(selector), 'nested', true);
      }, 'constructor', this), selectors);
    }
  },

  /**
   * Returns a custom interactor creator using the provided methods, properties, assertions, and
   * options. Methods and interactors are wrapped to facilitate parent-child
   * relationships. Assertions and interactors aref saved to a copy of the inherited assert
   * function's prototype to be used during interactor creation when binding assert methods. Options
   * can also be set and accessed via static properties. Unknown options will be applied as static
   * properties as well.
   *
   * Available options:
   * - `name` (_default_ `""`) — the interactor name used in error messages.
   * - `selector` (_default_ `s => s`)— a selector creator that accepts the selector provided to new
   *   interactors and returns a selector string or function that is used to find the element in the DOM.
   * - `timeout` (_default_ `2000`) — the default assertion timeout used by instances of this interactor.
   * - `dom` (_default_ `window`) — the window interface containing the DOM document to operate on.
   * - `suppressLayoutEngineWarning` (_default_ `false`) — suppresses the warning caused by invoking
   *   layout related properties or methods when there is non layout engine, such as within jsdom.
   *
   * ``` javascript
   * // properties only
   * const Btn = I.extend({
   *   type: I.attribute('type')
   * });
   *
   * await Btn('.btn')
   *   .assert.type('button')
   *   .click();
   *
   * // with options
   * const Link = I.extend({
   *   name: 'link',
   *   selector: t => I.find.text(t, 'a')
   * }, {
   *   href: I.attribute('href')
   * });
   *
   * await Link('About')
   *   .assert.href('/')
   *   .click();
   * //=> InteractorError: "Click Me" link href is "/about" but expected "/"
   * ```
   *
   * @memberof Core
   * @name I.extend
   * @param {object} [options] - Static interactor options.
   * @param {object} [properties] - Additional interactor properties.
   * @returns {function} A new extended interactor creator
   */
  extend: { value: extend },

  /**
   * @alias Interactor.assertion
   * @readonly
   */
  assertion: { value: assertion },

  /**
   * Interactor error creator for formatting error messages using specific directives when thrown
   * within interactor contexts.
   *
   * - `%{@ <sel>}` - Friendly interactor name with optional child selector
   * - `%{- <t>|<f>}` - Use `<t>` when expecting a success, `<f>` when expecting a failure
   * - `%{" <val>}` - Quote values that look like strings
   *
   * ``` javascript
   * const Btn = I.extend({
   *   assert: {
   *     type(expected) {
   *       let actual = this.$().type;
   *
   *       if (actual !== expected) throw I.Error(
   *         `%{@} type is %{"${actual}} but expected %{-%{"${expected}}|it not to be}`
   *       );
   *     }
   *   }
   * });
   *
   * await Btn('.btn').assert.type('submit');
   * //=> InteractorError: .btn type is "button" but expected "submit"
   * await Btn('.submit').assert.not.type('submit');
   * //=> InteractorError: .submit type is "submit" but expected it not to be
   * ```
   *
   * @memberof Core
   * @name I.Error
   * @alias InteractorError
   * @param {String} message - The error message with optional directives
   * @returns {InteractorError}
   */
  Error: { value: InteractorError },

  /**
   * @memberof Core
   * @name I.name
   * @type {String}
   * @default ""
   * @ignore
   */
  name: { writable: true, value: '' },

  /**
   * @memberof Core
   * @name I.timeout
   * @type {Number}
   * @default 2000
   * @ignore
   */
  timeout: { writable: true, value: 2000 },

  /**
   * @memberof Core
   * @name I.selector
   * @type {Function}
   * @default s => s
   * @ignore
   */
  selector: {
    configurable: true,
    get: () => s => s,
    set: function setSelectorFn(selector) {
      defineProperty(this, 'selector', {
        configurable: true,
        set: setSelectorFn,
        get: () => s => {
          let sel = typeof selector === 'function' ? selector(s) : s ?? selector;
          let toString = sel && hasOwn(sel, 'toString') ? sel.toString : (
            // do not show the default selector in messages if named
            () => s ?? ((!this.name && sel?.toString()) || ''));

          return assign((
            // always return a selector function
            typeof sel === 'function' ? sel : () => sel
          ), { toString });
        }
      });
    }
  },

  /**
   * @memberof Core
   * @name I.dom
   * @type {Object}
   * @default window
   * @ignore
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
   * @memberof Core
   * @name I.suppressLayoutEngineWarning
   * @type {Boolean}
   * @default false
   * @ignore
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
  }
});

assign(Interactor.prototype, {
  /**
   * Returns a child element or the interactor element when no selector is provided. Throws when the
   * element or parent element cannot be found.
   *
   * ``` html
   * <button><span>Click Me</span></button>
   * ```
   *
   * ``` javascript
   * I('button').$() === document.querySelector('button');
   * //=> true
   * I('button').$('span') === document.querySelector('button span');
   * //=> true
   * I('button').$('div');
   * //=> InteractorError: could not find div within button
   * ```
   *
   * @memberof Core
   * @name I#$
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
   * ``` html
   * <ul>
   *   <li>One</li>
   *   <li>Two</li>
   *   <li>Three</li>
   * </ul>
   * ```
   *
   * ``` javascript
   * I('ul').$$('li');
   * //=> [<li>One</li>, <li>Two</li>, <li>Three</li>]
   * I('ul').$$('span');
   * //=> []
   * ```
   *
   * @memberof Core
   * @name I#$$
   * @param {String|Function} selector - Interactor selector string or function.
   * @returns {Element[]} The found child elements within the root element.
   */
  $$(selector) {
    return query.call(this, selector, true);
  },

  /**
   * Retreives or sets the interactor's assertion timeout. This timeout is used to determine when an
   * assertion or group of assertions should fail after being retried repeatedly.
   *
   * ``` html
   * <p>Foo Bar</p>
   * ```
   *
   * ``` javascript
   * // by default, this assertion will fail after 2 seconds
   * await I('p')
   *   .assert.text('Bar Baz');
   *
   * // this assertion will fail after 1 second
   * await I('p').timeout(1000)
   *   .assert.text('Bar Baz');
   * ```
   *
   * @memberof Core
   * @name I#timeout
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
   * ``` html
   * <span class="buttons">
   *   <button class="a">Item A</button>
   *   <button class="b">Item B</button>
   * </span>
   * ```
   *
   * ``` javascript
   * await I('.buttons')
   *   // parent.find() returns a child interactor ...
   *   .find('.a').click()
   *   // ... child.click() returns a parent interactor
   *   .find('.b').click();
   * ```
   *
   * @memberof Core
   * @name I#find
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
   * ``` javascript
   * await I('form')
   *   .assert(function() {
   *     let $input = this.$('input');
   *     // assert something with $input here
   *   })
   *     // ... OR ...
   *   .find('input').assert($input => {
   *     // assert something with $input here
   *   });
   * ```
   *
   * Various built-in assertions are also defined as assert methods along with custom assertions
   * defined by extended interactors.
   *
   * @memberof Core
   * @name I#assert
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
   * topmost interactor instance is returned. If the provided assertion defines an argument, the
   * interactor's element will be provided as that argument.
   *
   * ``` javascript
   * await I('input')
   *   .exec($i => $i.checkValidity())
   *   .assert.matches('.invalid');
   * ```
   *
   * @memberof Core
   * @name I#exec
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
   * substring `%{e}` will be replaced with the thrown error message.
   *
   * ``` javascript
   * await I('.btn').click()
   *   .catch(err => {
   *     // do something with the error here
   *   });
   *
   * await I('.btn').click()
   *   .catch('Unable to click - %{e}');
   * //=> InteractorError: Unable to click - .btn is disabled
   * ```
   *
   * @memberof Core
   * @name I#catch
   * @param {Function|String} handler - The error handler or an error message string.
   * @returns {Interactor} A new interactor instance with the handler added to its queue.
   */
  catch(handler) {
    if (typeof handler === 'string') {
      let message = handler;

      handler = err => {
        if (err.name === 'InteractorError')
          throw err.format(message);
        else
          throw err;
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
   * called within. Sequential queued assertions are pushed to a deferred function that is then
   * called before the next queued function that is not an assertion. Queued functions that throw
   * interactor errors are formatted with the current interactor instance.
   *
   * ``` javascript
   * // not run until awaited on, or .then is called
   * let clickBtn = I('button').click();
   *
   * // interactor's .catch returns another interactor which is still not run
   * clickBtn = clickBtn.catch('Unable to click - %{e}');
   *
   * // awaiting on an interactor automatically invokes .then
   * await clickBtn;
   *
   * // interactors are immutable and can run multiple times
   * await clickBtn;
   *
   * // .then runs the interactor and returns a native Promise
   * clickBtn.then(() => ...).catch(...);
   * ```
   *
   * @memberof Core
   * @name I#then
   * @param {Function} [onFulfilled] - Passed along to the resulting Promise#then method.
   * @param {Function} [onRejected] - Passed along to the resulting Promise#then method.
   * @returns {Promise} A promise that resolves once all queued functions have run.
   */
  then() {
    let { queue, timeout, interval } = m.get(this);
    let assertion;

    return queue.reduce((promise, action, i) => {
      let { type, ctx, fn } = action;
      let wrapper = fn => fn();
      if (!fn) type = null;

      // bind the action to its associated instance and call any additional function beforehand; if
      // the action requires an argument, the interactor instance element is provided
      let bind$ = (fn, f) => named(fn.name, () => wrapper(() => {
        return (f?.(), fn.length ? fn.call(ctx, ctx.$()) : fn.call(ctx));
      }));

      // format any thrown interactor errors
      let onError = err => {
        throw err.name === 'InteractorError' ? err.bind(ctx) : err;
      };

      // track assertions
      if (type === 'assert')
        assertion = bind$(fn, assertion);

      // execute and clear assertions within a convergence
      if (assertion && (type !== 'assert' || i === queue.length - 1)) {
        let converge = when(assertion, { remains: action.remains, interval, timeout });
        promise = promise.then(converge).catch(onError);
        assertion = null;
      }

      if (type === 'exec') {
        // execute bound exec functions with any defined middleware
        wrapper = this.constructor.executionMiddleware ?? wrapper;
        promise = promise.then(bind$(fn)).catch(onError);
      } else if (type === 'catch') {
        // bind any catch handler
        promise = promise.catch(fn.bind(ctx));
      }

      return promise;
    }, Promise.resolve()).then(...arguments);
  },

  /**
   * Returns a string representation of the interactor using its selector and any parent.
   *
   * @memberof Core
   * @name I#toString
   * @returns {String} - A string representation of the interactor.
   * @ignore
   */
  toString() {
    let name = this.constructor.name;
    let { parent, nested, selector } = m.get(this);
    let string = selector?.toString() || '';

    if (!string) string = name || '';
    else if (name) string += ` ${name}`;

    if (nested && m.get(parent, 'selector'))
      string += `${string && ' within '}${parent}`;

    return string;
  }
});

// define built-in actions and properties
defineInteractorProperties(
  Interactor.prototype,
  assign({}, actions, properties)
);
