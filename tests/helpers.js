import { strict as assert } from 'assert';

const { assign, defineProperty } = Object;

// Returns true when running in jsdom
export function jsdom() {
  return (jsdom.result = jsdom.result ?? navigator.userAgent.includes('jsdom'));
}

// In jsdom, when elements lose focus they nullify the _lastFocusedElement which is reflected in
// document.hasFocus(); this sets focus back to the body so that hasFocus() is accurate.
function jsdomCaptureFocus(e) {
  if (e.relatedTarget === e.currentTarget.ownerDocument) {
    e.currentTarget.ownerDocument.body.focus();
  }
}

// In jsdom, the dom is not automatically focused and window.focus() is not implemented;
// additionally, even though the body has a default tabIndex of -1, jsdom will not focus the body
// unless it has an explicit tabindex attribute.
function jsdomFocusDocument(doc) {
  doc.body.setAttribute('tabIndex', -1);
  doc.body.focus();
};

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

  // format HTML to remove extraneous spaces
  let ind = innerHTML.match(/^\n(\s*)/)?.[1]?.length;
  innerHTML = innerHTML.replace(new RegExp(`^\\s{${ind}}`, 'mg'), '').trim();

  // assign HTML and append to the body
  assign($test, { id: 'test', innerHTML });
  document.body.appendChild($test);

  if (jsdom()) {
    // apply focus hacks to the current document
    if (!document.body.hasAttribute('tabindex')) {
      document.body.addEventListener('focusout', jsdomCaptureFocus);
    }

    // jsdom doesn't support srcdoc or sandbox
    for (let $f of $test.querySelectorAll('iframe')) {
      // polyfill srcdoc
      $f.setAttribute('src', `data:text/html;charset=utf-8,${
        encodeURI($f.getAttribute('srcdoc'))
      }`);

      if ($f.getAttribute('sandbox') != null) {
        // simulate sandbox without breaking jsdom
        defineProperty($f, 'contentDocument', { value: null });
      } else {
        // apply the focus hacks to frame documents
        $f.addEventListener('load', () => {
          $f.contentDocument.body.addEventListener('focusout', jsdomCaptureFocus);

          $f.addEventListener('focus', e => {
            if (!e.defaultPrevented) jsdomFocusDocument($f.contentDocument);
          });
        });
      }
    }

    // jsdom doesn't support isContentEditable
    for (let $e of $test.querySelectorAll('[contenteditable]')) {
      defineProperty($e, 'isContentEditable', { value: true });
    }

    // autofocus the document
    jsdomFocusDocument(document);
  }

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

  $el.addEventListener(event, function(evt) {
    return (results.count++, fn?.call(this, evt));
  });

  return results;
}

// Mock console methods for testing.
export function mockConsole() {
  let names = ['warn'];
  let mock = {};

  let og = names.reduce((o, name) => (
    assign(o, { [name]: console[name] })
  ), {});

  beforeEach(() => {
    names.forEach(name => {
      mock[name] = console[name] = msg => mock[name].calls.push(msg);
      mock[name].calls = [];
    });
  });

  afterEach(() => {
    names.forEach(name => (console[name] = og[name]));
  });

  return mock;
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
