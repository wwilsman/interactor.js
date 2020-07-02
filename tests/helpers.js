import { strict as assert } from 'assert';

const { assign } = Object;

function createHook(fn, t) {
  return function() {
    let teardown = t?.();
    let setup = () => (t = fn.apply(this, arguments));
    return typeof teardown?.then === 'function'
      ? teardown.then(setup) : setup();
  };
}

export const fixture = createHook(innerHTML => {
  let $test = document.createElement('div');
  assign($test, { id: 'test', innerHTML });
  document.body.appendChild($test);
  return () => $test.remove();
});

export function e(name, message) {
  return { name, message };
}

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
