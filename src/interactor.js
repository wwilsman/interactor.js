import InteractorKeyboard from './keyboard';
import InteractorAssert from './assert';
import InteractorError from './error';
import extend from './extend';
import when from './when';
import m from './meta';

import actions from './actions';
import properties, { assertions } from './properties';

import {
  query
} from './dom';
import {
  assign,
  defineProperty,
  defineProperties,
  getPrototypeOf
} from './utils';

// The base interactor class sets initial metadata and creates bound assert methods. When no
// selector is provided and there is no default selector, the interactor will reference the parent
// interactor element or the document body if there is no parent interactor.
export default function Interactor(selector) {
  if (!(this instanceof Interactor)) {
    return new Interactor(selector);
  }

  m.set(this, {
    timeout: this.constructor.timeout,
    selector: selector ?? this.constructor.selector,
    keyboard: InteractorKeyboard(),
    interval: 10,
    queue: []
  });

  defineProperty(this, 'assert', {
    value: InteractorAssert(this)
  });
}

defineProperties(Interactor, {
  // Default interactor options
  name: { value: '' },
  selector: { value: '' },
  timeout: { value: 2000 },

  // Static methods
  error: { value: InteractorError },
  extend: { value: extend },

  // DOM association getter/setter
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

  // Control suppression of the layout engine warning
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

// define default properties
defineProperties(Interactor.prototype, properties);

// define actions and methods
assign(Interactor.prototype, actions, {
  // Return a child element or the interactor element when no selector is provided.
  $(selector) {
    return query.call(this, selector);
  },

  // Return an array of child elements; errors when no selector is provided.
  $$(selector) {
    return query.call(this, selector, true);
  },

  // Retreives or sets the interactor's default timeout for assertions.
  timeout(ms) {
    return ms
      ? m.new(m.top(this), 'timeout', ms)
      : m.get(m.top(this), 'timeout');
  },

  // Returns a child interactor instance referencing the selector.
  find(selector) {
    let q = m.get(selector, 'queue');
    let i = q ? selector : Interactor(selector);

    if ((q || m.get(i, 'queue')).length) {
      throw InteractorError('the provided interactor must not have queued actions');
    }

    return m.new(i, 'parent', this);
  },

  // Adds an assertion to the next interactor instance's queue.
  assert: m.set(function assert(assertion) {
    return m.new(this, 'queue', q => {
      return q.concat({
        type: 'assert',
        fn: assertion,
        ctx: this
      });
    });
  }, 'fns', assertions),

  // Adds a callback to the next interactor instance's queue. If an interactor with queued actions
  // is provided, those actions are appended to the next topmost interactor queue as child actions
  // and the next topmost interactor instance is returned.
  exec(callback) {
    let iq = m.get(callback, 'queue');

    return m.new(this, 'queue', q => {
      return q.concat(iq ? (
        iq.map(a => assign({}, a, {
          ctx: m.new(a.ctx, 'parent', this)
        }))
      ) : {
        type: 'exec',
        fn: callback,
        ctx: this
      });
    });
  },

  // Adds an error handler to the next interactor instance's queue.
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

    return m.new(this, 'queue', q => {
      return q.concat({
        type: 'catch',
        fn: handler,
        ctx: this
      });
    });
  },

  // Start processing this interactor instance's queue and return a promise, allowing interactors to
  // be used with the async/await syntax. Queued actions are bound to the instance it was called
  // within. Sequential assertions are pushed to a deferred function that is then called before the
  // next queued action that is not an assertion. Actions that throw interactor errors are formatted
  // with the current interactor instance.
  then() {
    let { queue, timeout, interval } = m.get(this);
    let assertion;

    return queue.reduce((promise, action, i) => {
      let { type, ctx, fn } = action;
      if (!fn) type = null;

      // bind the action to its associated instance and call any additional function beforehand; if
      // the action requires an argument, the interactor instance element is provided
      let bind$ = (fn, f) => () => {
        if (f) f();

        return fn.length
          ? fn.call(ctx, ctx.$())
          : fn.call(ctx);
      };

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

  // Returns a string representation of the interactor using its selector and any parent.
  toString() {
    let name = this.constructor.name;
    let { parent, selector } = m.get(this);
    let string = selector.toString();

    if (name) string += ` ${name}`;
    if (parent && m.get(parent, 'selector')) {
      string += ` within ${parent}`;
    }

    return string;
  }
});
