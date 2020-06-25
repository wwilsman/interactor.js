import m from './meta';

import {
  assign,
  create,
  defineProperties,
  mapPropertyDescriptors
} from './utils';

// Wraps a property descriptor so that if a method or property returns an interactor, it is properly
// associated with its parent interactor or its queue is appended to the parent queue.
function wrapd({ get, value }, key) {
  // disallow certain properties from being included
  if (['assert', 'interactor'].includes(key)) return;

  let fn = get || value;

  // guaranteed to be an interactor
  if (m.get(value, 'queue')) {
    // interactors are lazily wrapped via a getter
    fn = get = () => value;
  } else if (typeof fn !== 'function') {
    // anything other than a function or interactor is assigned directly
    return { value };
  }

  return {
    [get ? 'get' : 'value']: function() {
      let ctx = m.new(this, 'parent', null);
      let ret = fn.apply(ctx, arguments);
      let queue = m.get(ret, 'queue');

      // guaranteed to be a different interactor than the parent interactor
      if (queue && !m.eq(this, ret)) {
        // append its queue or associate it with the parent interactor
        return queue.length && !get
          ? this.find(ret)
          : m.new(ret, 'parent', this);
      }

      return ret;
    }
  };
}

// Used to ignore reserved assert properties
function filterAsserts(fn) {
  return (d, k) => {
    if (['remains', 'not'].includes(k)) {
      console.warn(`\`${k}\` is a reserved assertion property and will be ignored`);
      return;
    }

    return fn ? fn(d, k) : d;
  };
}

// Returns a custom interactor creator using the provided methods, properties, assertions, and
// options. Methods and interactors are wrapped to facilitate parent-child relationships. Assertions
// and interactors are also saved to a copy of the inherited assert function's prototype to be used
// during interactor creation when binding assert methods. Options, such as the default constructor
// selector and interactor name, may be defined by providing an `interactor` property, which will
// not be applied to the final interactor creator.
export default function extend(properties = {}) {
  let Parent = this;
  let assert = this.prototype.assert;

  // destructuring and rest causes getters to be invoked; these properties are disallowed in the
  // property descriptor wrapping function above
  let assertions = properties.assert || {};
  let options = properties.interactor || {};

  function Extended(selector) {
    if (!(this instanceof Extended)) {
      return new Extended(selector);
    }

    Parent.call(this, selector);
  };

  return defineProperties(Extended, {
    // define the custom interactor's options
    name: { value: options.name ?? Parent.name },
    selector: { value: options.selector ?? Parent.selector },
    timeout: { value: options.timeout || Parent.timeout },

    // define inherited static methods
    extend: { value: extend },

    // extend the parent prototype
    prototype: {
      value: create(Parent.prototype, assign((
        // wrap properties to create parent-child relationships
        mapPropertyDescriptors(properties, wrapd)
      ), {
        // correct the constructor
        constructor: { value: Extended },

        // copy the parent assert with additional functions and interactors
        assert: {
          value: m.set(function() {
            return assert.apply(this, arguments);
          }, {
            fns: create(m.get(assert, 'fns') || null, (
              mapPropertyDescriptors(assertions, filterAsserts())
            )),
            children: mapPropertyDescriptors(properties, filterAsserts(({ value }) => {
              let queue = m.get(value, 'queue');
              // only interactors without actions become children
              if (queue && !queue.length) return value;
            }))
          })
        }
      }))
    }
  });
}
