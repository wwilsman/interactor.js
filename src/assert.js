import m from './meta';
import error from './error';

import {
  assign,
  create,
  defineProperty,
  defineProperties,
  mapPropertyDescriptors,
  named,
  map
} from './utils';

// Returns an interactor assert function that automatically handles negation. The matcher function
// should return an object with a message and a result.
export function assertion(get, matcher = get) {
  get = matcher === get ? null : get;

  return function(expected, ...args) {
    if (get) {
      let value = get.apply(this, args.slice(0, get.length));
      args = [value].concat(args);
    }

    let { message, result } = matcher.apply(this, args);

    if (result !== expected) {
      throw error(message);
    }
  };
}

// Returns an auto-generated assertion. If an argument is supplied to the resulting assertion, it
// will be compared with the value resulting from the provided function. With no argument, and when
// the result is a boolean, the error message is reworded to be stateful.
export function createAssert(name, fn) {
  return named(name, assertion(fn, function(actual, ...args) {
    let what = fn?.length ? args[0] : name;
    let message = `%{@} ${what} is %{"${actual}}`;
    let expected = args[fn?.length || 0];
    let result = !!actual;

    if (expected != null) {
      message += ` but expected %{- %{"${expected}}|it not to be}`;

      // allow regular expression comparisons to strings
      if (typeof actual === 'string' && expected instanceof RegExp) {
        result = expected.test(actual);
        // allow custom comparisons
      } else if (typeof expected === 'function') {
        result = expected.call(this, actual);
        result = typeof result === 'undefined' || result;
        // default to strict equality
      } else {
        result = actual === expected;
      }
    } else if (typeof actual === 'boolean') {
      message = `%{@} is %{- not} ${what}`;
    }

    return { message, result };
  }));
}

// Used to replace core methods within the assert context
function ctxError() {
  throw error('interactor methods should not be called within assertions');
}

function mapAssertMethods(assert, expected, ctx, negated = !expected) {
  return (fn, name) => ({
    value: (...args) => {
      return assert(named(
        `assert${negated ? '.not' : ''}.${name}`,
        function(...a) {
          let c = ctx || context(this, expected);
          c.assert(fn.bind(c, expected, ...args, ...a));
        }
      ));
    }
  });
}

function mapAssertChildren(assert, inst, negated) {
  return (child, name) => ({
    [typeof child === 'function' ? 'value' : 'get']: named(
      `assert${negated ? '.not' : ''}.${name}`,
      (...args) => assert(m.new(typeof child === 'function' ? (
        child.apply(m.new(inst, 'top', true), args)
      ) : child, 'parent', inst))
    )
  });
}

function context(i, expected, negated) {
  let proto = i.constructor.prototype;
  let { assertions, children } = m.get(proto.assert);

  // ensure nested interactors return nested contexts within assertions
  let ctx = create(i, mapPropertyDescriptors(proto, ({ get, value }, key) => {
    // leave these core properties alone
    if (['constructor', '$', '$$', 'assert'].includes(key)) return;

    // these core methods shouldn't be called within assertions
    if (['timeout', 'exec', 'catch', 'then'].includes(key)) {
      return { value: ctxError };
    }

    return {
      [get ? 'get' : 'value'](...args) {
        let ret = (get || value).apply(this, args);
        // if an interactor was returned, return its assert context
        return m.get(ret, 'queue') ? context(ret, expected) : ret;
      }
    };
  }));

  defineProperties(ctx, {
    assert: {
      value(f) {
        if (m.get(f, 'queue')) {
          return context(f, expected, negated).assert;
        }

        // in assert contexts, the assert method executes immediately
        try { f.apply(this); } catch (err) {
          // bind interactor errors to the instance and expectation
          if (err.name === 'InteractorError') err.bind(this, expected);
          throw err;
        }

        return this;
      }
    }
  });

  // lazily bind assert properties to assert contexts
  defineProperties(ctx.assert, assign(
    map(assertions, mapAssertMethods(f => f(), expected, ctx, negated)),
    map(children, mapAssertChildren(ctx.assert, i, negated))
  ));

  if (!negated) {
    // lazily create a negated context
    defineProperty(ctx.assert, 'not', {
      get: () => context(i, !expected, true).assert
    });
  }

  return ctx;
}

export default function InteractorAssert(i, expected = true) {
  let passert = i.constructor.prototype.assert;
  let { assertions, children } = m.get(passert);

  // create an instance bound assert
  let assert = function assert(f) {
    if (m.get(f, 'queue')) {
      return InteractorAssert(f, expected);
    }

    // assertions are called with an assert context and can be negated on error
    return passert.call(i, defineProperties(function() {
      try {
        f.apply(context(this, expected), arguments);
        if (expected) return;
      } catch (err) {
        if (err.name === 'InteractorError') err.bind(this, expected);
        if (expected) throw err;
        return;
      }

      throw error('expected assertion to fail but it passed');
    }, {
      name: { value: f.name },
      // used to determine invoking the interactor element
      length: { value: f.length }
    }));
  };

  // lazily bind assert properties to assert contexts
  defineProperties(assert, assign(
    map(assertions, mapAssertMethods(passert.bind(i), expected)),
    map(children, mapAssertChildren(assert, i, !expected))
  ));

  // do not apply these properties to negated instances
  if (expected) {
    defineProperties(assert, {
      // lazily create a negated instance
      not: {
        get: () => InteractorAssert(i, false)
      },

      // persist previous assertions once passing
      remains: {
        value: function remains(ms = 500) {
          let q = m.get(i, 'queue');

          if (q[q.length - 1]?.type !== 'assert') {
            throw error('no previous assertion to persist');
          }

          return m.new(i, 'queue', {
            type: 'assert',
            remains: ms
          });
        }
      }
    });
  }

  return assert;
}
