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
function context(inst, expected) {
  let { fns, children } = m.get(inst.constructor.prototype.assert);
  let ctx = create(null);

  defineProperties(ctx, assign(
    // bind all custom assertions to the context
    mapPropertyDescriptors(fns, ({ value: fn }) => ({
      value: wrapContext(ctx, fn, expected).bind(inst)
    })),
    // child interactors create assert context references
    mapPropertyDescriptors(children, ({ value }) => ({
      get: () => context(m.new(value, 'parent', inst), expected)
    })), {
      // allow assertions access to the interactor element
      $: { value: inst.$.bind(inst) },
      $$: { value: inst.$$.bind(inst) }
    }
  ));

  if (expected || m.get(inst, 'parent')) {
    // lazily create a negated context
    defineProperty(ctx, 'not', {
      get: () => context(inst, !expected)
    });
  }

  return ctx;
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
  };
}

// Bind an assertion to a context, bind any thrown interactor error, and throw when an error is
// expected but not encountered.
function wrapAssertion(fn, expected) {
  return function(...args) {
    try {
      fn.apply(context(this, expected), args);
    } catch (err) {
      if (err.name === 'InteractorError') {
        err.bind(this, expected);
      }

      if (expected) throw err;
      return;
    }

    if (!expected) {
      throw error('expected assertion to fail but it passed');
    }
  };
}

// Returns an instance of the interactor's assert function that contains additional assertion
// functions, child assertions, and other core assert methods.
export default function InteractorAssert(inst, expected = true) {
  let passert = inst.constructor.prototype.assert;
  let { fns, children } = m.get(passert);

  let assert = defineProperties(function assert(fn) {
    // generic assertions are called with an assert context
    return passert.call(inst, defineProperties(wrapAssertion(fn, expected), {
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
