import m from './meta';
import { createAssert } from './assert';

import {
  assign,
  create,
  defineProperty,
  defineProperties,
  getOwnPropertyDescriptor,
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

function wrapInteractorProperty(name, fn, getter) {
  return {
    configurable: true,
    [getter ? 'get' : 'value']: named(name, function() {
      let result = fn.apply(m.new(this, 'top', true), arguments);
      let queue = m.get(result, 'queue');

      // guaranteed to be a unique instance not from the current instance
      if (queue && !m.eq(this, result)) {
        // associate the instance with the parent interactor
        result = m.new(result, 'parent', this);
        // execute an action or return the result
        return (queue.length && !getter) ? this.exec(result) : result;
      }

      return result;
    })
  };
}

function defineInteractorProperty(I, name, descr) {
  let { assert, call, child, get } = descr;

  if (get || call || typeof child === 'function') {
    defineProperty(I.prototype, name, (
      wrapInteractorProperty(name, (get || call || child), !!get)
    ));
  } else if (child) {
    defineProperty(I.prototype, name, (
      wrapInteractorProperty(name, () => child, true)
    ));
  }

  if (assert !== false && (assert || get || call)) {
    m.set(I.prototype.assert, 'assertions', a => (
      assign(a ?? {}, { [name]: assert ?? createAssert(name, (get || call)) })
    ));
  } else if (child) {
    m.set(I.prototype.assert, 'children', c => (
      assign(c, { [name]: child })
    ));
  }

  return I;
}

export function defineInteractorProperties(I, properties) {
  for (let key in properties) {
    defineInteractorProperty(I, key, properties[key]);
  }

  return I;
}

// Returns a custom interactor creator using the provided methods, properties, assertions, and
// options. Methods and interactors are wrapped to facilitate parent-child relationships. Assertions
// and interactors are also saved to a copy of the inherited assert function's prototype to be used
// during interactor creation when binding assert methods. Options, such as the default constructor
// selector and interactor name, may be defined by providing an `interactor` property, which will
// not be applied to the final interactor creator.
export default function extend(properties = {}) {
  let Parent = this;
  let options = properties.interactor;

  function Extended(selector) {
    if (!(this instanceof Extended)) {
      return new Extended(selector);
    }

    Parent.call(this, selector);
  };

  defineProperties(Extended, {
    // define the custom interactor's options
    name: { value: options?.name ?? Parent.name },
    selector: { value: options?.selector ?? Parent.selector },
    timeout: { value: options?.timeout || Parent.timeout },

    // define inherited static properties
    extend: getOwnPropertyDescriptor(Parent, 'extend'),
    dom: getOwnPropertyDescriptor(Parent, 'dom'),

    suppressLayoutEngineWarning: (
      getOwnPropertyDescriptor(Parent, 'suppressLayoutEngineWarning')
    ),

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
  });

  if (properties.assert) {
    m.set(Extended.prototype.assert, 'assertions', a => (
      assign(a, map(properties.assert, (p, k) => reserved(k) ? null : p))
    ));
  }

  for (let key in properties) {
    if (key === 'assert' || key === 'interactor' || reserved(key)) continue;

    let { get, value } = getOwnPropertyDescriptor(properties, key);
    let property;

    if (get) {
      property = { get };
    } else if (typeof value === 'function') {
      property = { call: value, assert: false };
    } else if (m.get(value, 'queue')) {
      property = { child: value };
    } else if (getPrototypeOf(value) === Object.prototype) {
      property = value;
    }

    if (properties.assert?.[key]) {
      property.assert = false;
    }

    if (property) {
      defineInteractorProperty(Extended, key, property);
    }
  }

  // define dom reference while extending
  if (options?.dom) {
    Extended.dom = options.dom;
  }

  // suppress the layout engine warning for instances
  if (options?.suppressLayoutEngineWarning != null) {
    Extended.suppressLayoutEngineWarning = options.suppressLayoutEngineWarning;
  }

  return Extended;
}
