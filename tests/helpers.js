import { strict as assert } from 'assert';

const { assign } = Object;

// Helper which creates a generic testing hook. The provided function is called on setup and any
// returned function is called before the next setup call. If either function is asynchronous, the
// resulting function is also asynchronous.
function createHook(fn) {
  let t = null;

  return function() {
    let teardown = t?.();
    let setup = () => (t = fn.apply(this, arguments));
    return typeof teardown?.then === 'function'
      ? teardown.then(setup) : setup();
  };
}

// A testing hook which injects HTML into the document body and removes it upon the next call.
export const fixture = createHook(innerHTML => {
  let $test = document.createElement('div');
  assign($test, { id: 'test', innerHTML });
  document.body.appendChild($test);
  return () => $test.remove();
});

// Helper function useful for testing error messages while being slightly more readable.
export function e(name, message) {
  return { name, message };
}

// Helper function that attaches an event listener to an element and returns a reference to
// collected results of the event. The return value references the element being listened on and a
// count of triggered events. If a function is provided, it is also called on each event.
export function listen(selector, event, fn) {
  let $el = document.querySelector(selector);
  let results = { count: 0, $el };

  $el.addEventListener(event, evt => {
    results.count++;
    fn?.(evt);
  });

  return results;
}

// Extend the assert function with other useful assertions.
assign(assert, {
  typeOf(subj, expected, err) {
    let actual = typeof subj;

    return assert.equal(actual, expected, err || (
      new assert.AssertionError({
        operator: 'typeof',
        expected,
        actual
      })
    ));
  },

  instanceOf(subj, expected, err) {
    return assert(subj instanceof expected, err || (
      new assert.AssertionError({
        operator: 'instanceof',
        actual: subj,
        expected
      })
    ));
  },

  notInstanceOf(subj, expected, err) {
    return assert(!(subj instanceof expected), err || (
      new assert.AssertionError({
        operator: '!instanceof',
        actual: subj,
        expected
      })
    ));
  }
});

export { assert };
