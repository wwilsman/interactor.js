import { Interactor } from 'interactor.js';

// Test interactor scoped to the testing fixtures
export const I = new Interactor({
  root: () => document.getElementById('testing-root'),
  assert: { timeout: 100, reliability: 0 }
});

// Test hook which sets up and tears down HTML fixtures
export const fixture = innerHTML => {
  // clean up any existing testing-root
  document.getElementById('testing-root')?.remove();

  // format HTML to remove extraneous spaces
  let ind = innerHTML.match(/^\n(\s*)/)?.[1]?.length;
  innerHTML = innerHTML.replace(new RegExp(`^\\s{${ind}}`, 'mg'), '').trim();

  // assign HTML and append to the body
  document.body.appendChild(
    Object.assign(document.createElement('div'), {
      id: 'testing-root',
      innerHTML
    }));
};

// Test helper to create an event listener spy
export function listen(selector, event, fn) {
  let $ = document.querySelector(selector);
  let results = { $, calls: [] };

  $.addEventListener(event, function(...args) {
    results.calls.push(args);
    if (fn) return fn.apply(this, args);
  });

  return results;
}

// Test helper to throw an error if an assertion fails
export async function assert(assertion, failureMessage) {
  let result = false;

  if (typeof assertion === 'function')
    result = await assertion();
  else if (typeof assertion?.then === 'function')
    result = await assertion;
  else result = !!assertion;

  if (!result) throw new Error(failureMessage);
}

// Test helper to assert against thrown error messages
assert.throws =
  async function assertThrows(func, expectedMessage) {
    try {
      if (typeof func === 'function') await func();
      else await func;
    } catch (error) {
      if (error.message === expectedMessage) return;

      throw new Error(`Unexpected error: ${error.message}`, {
        cause: error
      });
    }

    throw new Error('Expected an error to be thrown');
  };
