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
  '$', '$$',
  'assert', 'remains', 'not',
  'exec', 'catch', 'then'
];

function reserved(name) {
  if (RESERVED_PROPERTIES.includes(name)) {
    console.warn(`\`${name}\` is a reserved property and will be ignored`);
    return true;
  }
}

function isInteractorFn(fn) {
  return typeof fn === 'function' &&
    (('extend' in fn && 'find' in fn &&
      'assert' in fn.prototype &&
      'exec' in fn.prototype &&
      'then' in fn.prototype) ||
     isInteractorFn(m.get(fn, 'constructor')));
}

function isInteractorDescriptor(prop) {
  let proto = getPrototypeOf(prop);

  return (proto === Object.prototype || proto == null) &&
    ('child' in prop || 'value' in prop || 'get' in prop || 'assert' in prop);
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
          while (m.get(result, 'parent')) {
            result = m.get(result, 'parent').exec(result);
          }
        }
      }

      return result;
    })
  };
}

function defineInteractorProperty(proto, name, descr) {
  let { assert, child, get, value } = descr;

  if (get || value || typeof child === 'function') {
    defineProperty(proto, name, (
      wrapInteractorProperty(name, (get || value || child), !!get)
    ));
  } else if (child) {
    defineProperty(proto, name, (
      wrapInteractorProperty(name, () => child, true)
    ));
  }

  if (assert !== false && (assert || get || value)) {
    m.set(proto.assert, 'assertions', {
      [name]: assert || createAssert(name, (get || value))
    });
  } else if (child) {
    m.set(proto.assert, 'children', {
      [name]: child
    });
  }

  return proto;
}

export function defineInteractorProperties(proto, properties) {
  let { assert, ...descriptors } = getOwnPropertyDescriptors(properties);

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
    } else if (isInteractorFn(value)) {
      property = { child: s => value(s) };
    } else if (typeof value === 'function') {
      property = { value, assert: false };
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

export default function extend(options = {}, properties = options) {
  if (options === properties) options = null;
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
          }, m.get(Parent.prototype.assert))
        }
      })
    }
  }));

  // assign options as static properties to invoke setters
  assign(Extended, options);

  // define custom interactor assertions, actions, and properties
  defineInteractorProperties(Extended.prototype, properties);

  return Extended;
}
