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
// should return an object with a message and a result. If the matcher accepts arguments, the first
// argument is the element and all other arguments are forwarded from the assert invocation.
export function assertion(...matchers) {
  return function(expected, ...args) {
    let [{ message, result }] = matchers.reduce((next, fn) => {
      return [fn.apply(this, next.concat(args))];
    }, []);

    if (result !== expected) {
      throw error(message).bind(this, expected);
    }
  };
}

// Returns an auto-generated assertion. If an argument is supplied to the resulting assertion, it
// will be compared with the value resulting from the provided function. With no argument, and when
// the result is a boolean, the error message is reworded to be stateful.
export function createAssert(name, fn) {
  return named(name, assertion(fn, function(result, expected) {
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
  }));
}

// Used to replace core methods within the assert context
function ctxError() {
  throw error('interactor methods should not be called within assertions');
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
      [get ? 'get' : 'value']: (...args) => {
        let ret = (get || value).apply(ctx, args);
        // if an interactor was returned, return its assert context
        return m.get(ret, 'queue') ? context(ret, expected) : ret;
      }
    };
  }));

  defineProperties(ctx, {
    assert: {
      // in assert contexts, the assert method executes immediately
      value: defineProperties(f => {
        if (m.get(f, 'queue')) {
          return context(f, expected, negated).assert;
        }

        try { f.apply(ctx); } catch (err) {
          // bind interactor errors to the instance and expectation
          if (err.name === 'InteractorError') err.bind(i, expected);
          throw err;
        }

        return ctx;
      }, assign(
        // lazily bind assert properties to an assert context
        map(assertions, (assertion, name) => ({
          value: named(`assert.${name}`, (...args) => (
            ctx.assert(assertion.bind(ctx, expected, ...args))
          ))
        })),
        // bind assert properties to the instance context
        map(children, (child, name, getter = !!m.get(child, 'queue')) => ({
          [getter ? 'get' : 'value']: named(`assert.${name}`, (...args) => (
            ctx.assert(m.new(getter ? child : (
              child.apply(m.new(i, 'top', true), args)
            ), 'parent', i))
          ))
        }))
      ))
    }
  });

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
  let assert = defineProperties(function assert(f) {
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
  }, assign(
    // lazily bind assert properties to an assert context
    map(assertions, (assertion, name) => ({
      value: (...args) => {
        return passert.call(i, named(`assert.${name}`, function() {
          let ctx = context(this, expected);
          ctx.assert(assertion.bind(ctx, expected, ...args));
        }));
      }
    })),
    // bind assert properties to the instance context
    map(children, (child, name, getter = !!m.get(child, 'queue')) => ({
      [getter ? 'get' : 'value']: named(`assert.${name}`, (...args) => (
        assert(m.new(getter ? child : (
          child.apply(m.new(i, 'top', true), args)
        ), 'parent', i))
      ))
    }))
  ));

  // Do not apply these properties to negated instances
  if (expected) {
    defineProperties(assert, {
      // lazily create a negated instance
      not: {
        get: () => InteractorAssert(i, false)
      },

      // persist previous assertions once passing
      remains: {
        value: function remains(ms = 500) {
          return m.new(i, 'queue', q => {
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
