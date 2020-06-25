import m from './meta';
import error from './error';

import {
  assign,
  defineProperty,
  defineProperties,
  mapPropertyDescriptors
} from './utils';

// Builds a assert context around assertion functions and child interactors. This context is used
// for named asserts and allows reusing existing and shared asseriton functions.
function context(inst, expected) {
  let { fns, children } = m.get(inst.constructor.prototype.assert);

  let ctx = defineProperties(
    // bind all custom assertions to the context
    mapPropertyDescriptors(fns, ({ value: fn }) => function() {
      try {
        fn.apply(ctx, [expected].concat(arguments));
        // ensure interactor errors retain the right context before bubbling
        if (error.name === 'InteractorError' && !error.ctx) {
          throw assign(error, { ctx: inst });
        } else {
          throw error;
        }
      }
    }),
    // child interactors create assert context references
    assign(mapPropertyDescriptors(children, ({ value }) => ({
      get: () => context(m.new(value, 'parent', inst))
    })), {
      // allow assertions access to the interactor element
      $: { value: inst.$.bind(inst) }
    })
  );

  if (expected) {
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
  let { fns = {}, children = {} } = m.get(passert) || {};

  let assert = defineProperties(function() {
    return passert.apply(this, arguments);
  }, assign(
    // assertion functions are bound to an assert context and the current expected result
    mapPropertyDescriptors(fns, ({ value: fn }) => ({
      value: (...args) => passert.call(inst, function() {
        fn.apply(context(this, expected), [expected].concat(args));
      })
    })),
    // child interactors create child assert references
    mapPropertyDescriptors(children, ({ value: i }) => ({
      get: () => m.new(i, 'parent', inst).assert
    }))
  ));

  // do not apply these properties to negated instances
  if (expected) {
    // lazily create a negated instance
    defineProperty(assert, 'not', {
      get: () => InteractorAssert(inst, false)
    });

    // persist previous assertions once passing
    defineProperty(assert, 'remains', {
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
    });
  }

  return assert;
}
