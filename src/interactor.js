import m from './meta';
import query from './dom';
import when from './when';

import {
  assign,
  defineProperties
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
    interval: 10,
    queue: []
  });
}

// Default interactor options
defineProperties(Interactor, {
  name: { value: '' },
  selector: { value: '' },
  timeout: { value: 2000 }
});

defineProperties(Interactor.prototype, {
  // Return a child element or the interactor element when no selector is provided.
  $: {
    value: function $(selector) {
      return query.call(this, selector);
    }
  },

  // Return an array of child elements; errors when no selector is provided.
  $$: {
    value: function $$(selector) {
      return query.call(this, selector, true);
    }
  },

  // Retreives or sets the interactor's default timeout for assertions.
  timeout: {
    value: function timeout(ms) {
      return ms
        ? m.new(this, 'timeout', ms)
        : m.get(this, 'timeout');
    }
  },

  // Returns a child interactor instance referencing the selector. If the selector is an interactor
  // with queued actions, those actions are appended to the next topmost interactor queue as child
  // actions and the next topmost interactor instance is returned.
  find: {
    value: function find(selector) {
      let iq = m.get(selector, 'queue');
      let i = iq ? selector : Interactor(selector);
      iq = iq || m.get(i, 'queue');

      if (iq.length) {
        return m.new(this, 'queue', q => {
          return q.concat(iq.map(a => assign({}, a, {
            ctx: m.new(a.ctx, 'parent', this)
          })));
        });
      }

      return m.new(i, 'parent', this);
    }
  },

  // Adds an assertion to the next interactor instance's queue.
  assert: {
    value: function assert(assertion) {
      return m.new(this, 'queue', q => {
        return q.concat({
          type: 'assert',
          timeout: this.timeout(),
          fn: assertion,
          ctx: this
        });
      });
    }
  },

  // Adds a callback to the next interactor instance's queue.
  exec: {
    value: function exec(callback) {
      return m.new(this, 'queue', q => {
        return q.concat({
          type: 'exec',
          fn: callback,
          ctx: this
        });
      });
    }
  },

  // Adds an error handler to the next interactor instance's queue.
  catch: {
    value: function(handler) {
      return m.new(this, 'queue', q => {
        return q.concat({
          type: 'catch',
          fn: handler,
          ctx: this
        });
      });
    }
  },

  // Start processing this interactor instance's queue and return a promise, allowing interactors to
  // be used with the async/await syntax. Queued actions are bound to the instance it was called
  // within. Sequential assertions are pushed to a deferred function that is then called before the
  // next queued action that is not an assertion. Actions that throw interactor errors are formatted
  // with the current interactor instance.
  then: {
    value: function then() {
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

        // track assertions and keep the current timeout up to date
        if (type === 'assert') {
          assertion = bind$(fn, assertion);
          timeout = action.timeout;
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
    }
  },

  // Returns a string representation of the interactor using its selector and any parent.
  toString: {
    value: function toString() {
      let name = this.constructor.name;
      let { parent, selector } = m.get(this);
      let string = selector.toString();

      if (name) string += ` ${name}`;
      if (parent) string += ` within ${parent}`;

      return string;
    }
  }
});
