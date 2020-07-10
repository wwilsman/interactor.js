import m from './meta';
import error from './error';

import {
  assign,
  create,
  defineProperty,
  defineProperties,
  mapPropertyDescriptors
} from './utils';

// Builds an assert context around assertion functions and child interactors. This context is used
// for named asserts and allows reusing existing and shared assertion functions.
function context(inst, expected, skipNegation) {
  let { fns, children } = m.get(inst.constructor.prototype.assert);

  let ctx = create(null, assign(
    // ensure nested interactors return nested contexts within assertions
    mapPropertyDescriptors(inst.constructor.prototype, ({ get, value }, key) => {
      if (!get && typeof value !== 'function') {
        // leave raw values alone
        return { value };
      } else if (['timeout', 'exec', 'catch', 'then'].includes(key)) {
        // core methods shouldn't be called within assertions
        return { value: ctxError };
      }

      return {
        [get ? 'get' : 'value']: function() {
          let ret = (get || value).apply(inst, arguments);
          // if an interactor was returned, return its assert context
          return m.get(ret, 'queue') ? context(ret, expected) : ret;
        }
      };
    }), {
      // assertions are wrapped in further contexts
      assert: {
        value: create(null, assign(
          // lazily bind all custom assertions to the context
          mapPropertyDescriptors(fns, ({ value: fn }) => ({
            value: wrapContext(ctx, fn, expected).bind(inst)
          })),
          // child interactors create assert context references
          mapPropertyDescriptors(children, ({ value }) => ({
            get: () => context(m.new(value, 'parent', inst), expected).assert
          }))
        ))
      }
    }
  ));

  if (!skipNegation) {
    // lazily create a negated context
    defineProperty(ctx.assert, 'not', {
      get: () => context(inst, !expected, true).assert
    });
  }

  return ctx;
}

// Used to replace core methods within the assert context
function ctxError() {
  throw error('interactor methods should not be called within assertions');
}

// Bind an assertion to a context, the expected result, and bind any thrown interactor error.
function wrapContext(ctx, fn, expected, ...bound) {
  return function(...args) {
    try {
      fn.apply(ctx || context(this, expected), (
        [expected].concat(bound, args)
      ));
    } catch (err) {
      if (err.name === 'InteractorError') {
        err.bind(this, expected);
      }

      throw err;
    }

    return true;
  };
}

// Returns an interactor assert function that automatically handles negation. The matcher function
// should return an object with a message and a result. If the matcher accepts arguments, the first
// argument is the element and all other arguments are forwarded from the assert invocation.
export function assertion(...matchers) {
  return function(expected, ...args) {
    let [{ message, result }] = matchers.reduce((ret, fn) => {
      return [fn.apply(this, ret.concat(args))];
    }, []);

    if (result !== expected) {
      throw error(message);
    }
  };
}

// Returns an auto-generated assertion. If an argument is supplied to the resulting assertion, it
// will be compared with the value resulting from the provided function. With no argument, and when
// the result is a boolean, the error message is reworded to be stateful.
export function createAssertion(name, fn) {
  return assertion(fn, function(result, expected) {
    let message = `%{@} ${name} is "${result}"`;

    if (expected != null) {
      message += ` but expected %{- "${expected}"|it not to be}`;

      // allow regular expression comparisons to strings
      if (typeof result === 'string' && expected instanceof RegExp) {
        result = expected.test(result);
      // allow custom comparisons
      } else if (typeof expected === 'function') {
        result = expected.call(this, result);
        result = typeof result === 'undefined' || result;
      // default to strict equality
      } else {
        result = result === expected;
      }
    } else if (typeof result === 'boolean') {
      message = `%{@} is %{- not} ${name}`;
    } else {
      result = !!result;
    }

    return { message, result };
  });
}

// Returns an instance of the interactor's assert function that contains additional assertion
// functions, child assertions, and other core assert methods.
export default function InteractorAssert(inst, expected = true) {
  let passert = inst.constructor.prototype.assert;
  let { fns, children } = m.get(passert);

  let assert = defineProperties(function assert(fn) {
    // generic assertions are called with an assert context and can be negated on error
    return passert.call(inst, defineProperties(function() {
      try {
        fn.apply(context(this, expected), arguments);
        if (expected) return;
      } catch (err) {
        if (err.name === 'InteractorError') err.bind(this, expected);
        if (expected) throw err;
        return;
      }

      throw error('expected assertion to fail but it passed');
    }, {
      // used to determine invoking the interactor element
      length: { value: fn.length }
    }));
  }, assign(
    // assertion functions are bound to an assert context
    mapPropertyDescriptors(fns, ({ value: fn }) => ({
      value: (...args) => passert.call(inst, wrapContext(null, fn, expected, ...args))
    })),
    // child interactors create child assert references
    mapPropertyDescriptors(children, ({ value: i }) => ({
      get: () => m.new(i, 'parent', inst).assert
    }))
  ));

  // do not apply these properties to negated instances
  if (expected) {
    defineProperties(assert, {
      // lazily create a negated instance
      not: {
        get: () => InteractorAssert(inst, false)
      },

      // persist previous assertions once passing
      remains: {
        value: function remains(ms = 500) {
          return m.new(inst, 'queue', q => {
            if (q[q.length - 1]?.type !== 'assert') {
              throw error('no previous assertion to persist');
            }

            return q.concat({
              type: 'assert',
              remains: ms
            });
          });
        }
      }
    });
  }

  return assert;
}
