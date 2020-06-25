import m from './meta';
import error from './error';

import {
  assign,
  create,
  defineProperty,
  defineProperties,
  mapPropertyDescriptors
} from './utils';

// Negate assertions, bind the assert context, and handle returned interactor errors.
function wrap(ctx, fn, expected, boundargs = []) {
  return function(...args) {
    let ret;

    // create a context when necessary
    ctx = ctx || context(this, expected);

    try {
      ret = fn.apply(ctx, boundargs.concat(args));
    } catch (e) {
      // rethrow or swallow when negated
      if (expected) throw e;
      return;
    }

    // handle interactor errors
    if (ret?.name === 'InteractorError' && ret.result !== expected) {
      throw ret.bind(this);
    }

    if (!expected) {
      throw error('expected assertion to fail but it passed');
    }
  };
}

// Builds an assert context around assertion functions and child interactors. This context is used
// for named asserts and allows reusing existing and shared assertion functions.
function context(inst, expected) {
  let { fns, children } = m.get(inst.constructor.prototype.assert);
  let ctx = create(null);

  defineProperties(ctx, assign(
    // bind all custom assertions to the context
    mapPropertyDescriptors(fns, ({ value: fn }) => ({
      value: wrap(ctx, fn, expected)
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
      get: () => context(inst, false)
    });
  }

  return ctx;
}

// Returns an instance of the interactor's assert function that contains additional assertion
// functions, child assertions, and other core assert methods.
export default function InteractorAssert(inst, expected = true) {
  let passert = inst.constructor.prototype.assert;
  let { fns, children } = m.get(passert);

  let assert = defineProperties(function assert(fn) {
    // generic assertions are called with an assert context
    return passert.call(inst, defineProperties(wrap(null, fn, expected), {
      // used to determine invoking the interactor element
      length: { value: fn.length }
    }));
  }, assign(
    // assertion functions are bound to an assert context
    mapPropertyDescriptors(fns, ({ value: fn }) => ({
      value: (...args) => passert.call(inst, wrap(null, fn, expected, args))
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
