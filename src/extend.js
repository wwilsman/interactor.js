import m from './meta';
import { createAssert } from './assert';

import {
  assign,
  create,
  defineProperty,
  defineProperties,
  entries,
  getOwnPropertyDescriptors,
  getPrototypeOf,
  map,
  named
} from './utils';

// Used to ignore reserved properties
const RESERVED_PROPERTIES = [
  'interactor', '$', '$$',
  'assert', 'remains', 'not',
  'exec', 'catch', 'then'
];

function reserved(name) {
  if (RESERVED_PROPERTIES.includes(name)) {
    console.warn(`\`${name}\` is a reserved property and will be ignored`);
    return true;
  }
}

function isInteractorClass(klass) {
  return typeof klass === 'function' &&
    'extend' in klass &&
    'assert' in klass.prototype &&
    'exec' in klass.prototype &&
    'then' in klass.prototype;
}

function isInteractorDescriptor(prop) {
  let proto = getPrototypeOf(prop);

  return (proto === Object.prototype || proto == null) &&
    ('child' in prop || 'call' in prop || 'get' in prop || 'assert' in prop);
}

function wrapInteractorProperty(name, fn, getter) {
  return {
    enumerable: true,
    configurable: true,
    [getter ? 'get' : 'value']: named(name, function() {
      let top = m.get(this, 'top');
      // in property contexts, the current instance should always be considered the top instance
      let result = fn.apply(top ? this : m.new(this, 'top', true), arguments);
      let queue = m.get(result, 'queue');

      if (queue) {
        // is an instance of the current interactor
        if (m.eq(this, result)) {
          // re-apply the proper top value
          result = m.new(result, 'top', top);
        } else {
          // associate the instance with the parent interactor
          result = m.new(result, 'parent', this);
        }

        // execute a nested action or return the result
        if (!m.get(result, 'top') && queue.length && !getter) {
          return m.top(result).exec(result);
        }
      }

      return result;
    })
  };
}

function defineInteractorProperty(proto, name, descr) {
  let { assert, call, child, get } = descr;

  if (get || call || typeof child === 'function') {
    defineProperty(proto, name, (
      wrapInteractorProperty(name, (get || call || child), !!get)
    ));
  } else if (child) {
    defineProperty(proto, name, (
      wrapInteractorProperty(name, () => child, true)
    ));
  }

  if (assert !== false && (assert || get || call)) {
    m.set(proto.assert, 'assertions', {
      [name]: assert || createAssert(name, (get || call))
    });
  } else if (child) {
    m.set(proto.assert, 'children', {
      [name]: child
    });
  }

  return proto;
}

export function defineInteractorProperties(proto, properties) {
  let { assert, interactor, ...descriptors } = getOwnPropertyDescriptors(properties);

  if (assert) {
    m.set(proto.assert, 'assertions', (
      map(assert.value, (p, k) => reserved(k) ? null : p)
    ));
  }

  for (let [key, { get, value }] of entries(descriptors)) {
    if (reserved(key)) continue;
    let property;

    if (get) {
      property = { get };
    } else if (isInteractorClass(value)) {
      property = { child: s => value(s) };
    } else if (typeof value === 'function') {
      property = { call: value, assert: false };
    } else if (m.get(value, 'queue')) {
      property = { child: value };
    } else if (isInteractorDescriptor(value)) {
      property = value;
    }

    if (property && properties.assert?.[key]) {
      property.assert = false;
    }

    if (property) {
      defineInteractorProperty(proto, key, property);
    }
  }

  return proto;
}

// Returns a custom interactor creator using the provided methods, properties, assertions, and
// options. Methods and interactors are wrapped to facilitate parent-child relationships. Assertions
// and interactors are also saved to a copy of the inherited assert function's prototype to be used
// during interactor creation when binding assert methods. Options, such as the default constructor
// selector and interactor name, may be defined by providing an `interactor` property, which will
// not be applied to the final interactor creator.
export default function extend(properties = {}) {
  let Parent = this;

  function Extended(selector, props) {
    if (props) {
      return Extended.extend(props)(selector);
    } else if (!(this instanceof Extended)) {
      return new Extended(selector);
    }

    Parent.call(this, selector);
  };

  // define inherited static properties
  defineProperties(Extended, assign(getOwnPropertyDescriptors(Parent), {
    // extend the parent prototype
    prototype: {
      value: create(Parent.prototype, {
        // correct the constructor
        constructor: { value: Extended },

        // copy the parent assert
        assert: {
          value: m.set(function() {
            return Parent.prototype.assert.apply(this, arguments);
          }, {
            assertions: assign({}, m.get(Parent.prototype.assert, 'assertions')),
            children: assign({}, m.get(Parent.prototype.assert, 'children'))
          })
        }
      })
    }
  }));

  // assign custom static properties to invoke inherited setters
  assign(Extended, properties.interactor);

  // define custom interactor assertions, actions, and properties
  defineInteractorProperties(Extended.prototype, properties);

  return Extended;
}
