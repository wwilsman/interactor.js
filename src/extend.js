import m from './meta';
import { createAssertion } from './assert';

import {
  assign,
  create,
  defineProperties,
  getOwnPropertyDescriptor,
  mapPropertyDescriptors
} from './utils';

// Used to ignore reserved properties
const reserved = [
  'interactor', '$', '$$',
  'assert', 'remains', 'not',
  'exec', 'catch', 'then'
];

function filterReserved(descr, name) {
  if (reserved.includes(name)) {
    console.warn(`\`${name}\` is a reserved property and will be ignored`);
    return;
  }

  return descr;
}

// Wraps a property descriptor so that if a method or property returns an interactor, it is properly
// associated with its parent interactor or its queue is appended to the parent queue.
function wrapProperty({ get, value }) {
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
          ? this.exec(ret)
          : m.new(ret, 'parent', this);
      }

      return ret;
    }
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
  let options = properties.interactor;

  // extend parent assert with addition properties
  let passert = Parent.prototype.assert;
  let assertions = mapPropertyDescriptors(properties.assert, filterReserved);
  let children = create(null);

  // while mapping, collect additional assert properties
  let props = mapPropertyDescriptors(properties, (descr, key) => {
    // siliently ignore assert and interactor, but warn on other reserved properties
    if (['assert', 'interactor'].includes(key) || !filterReserved(descr, key)) return;

    // auto generate assertions based on getters when necessary
    if (descr.get && !assertions[key]) {
      assertions[key] = { value: createAssertion(key, descr.get) };
    }

    // action-less interactors become assert children
    if (m.get(descr.value, 'queue')?.length === 0) {
      children[key] = descr;
    }

    // make nested interactors parent-aware
    return wrapProperty(descr);
  });

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
      value: create(Parent.prototype, assign(props, {
        // correct the constructor
        constructor: { value: Extended },

        // copy the parent assert with additional functions and interactors
        assert: {
          value: m.set(function() {
            return passert.apply(this, arguments);
          }, {
            fns: create(m.get(passert, 'fns'), assertions),
            children: create(m.get(passert, 'children') || null, children)
          })
        }
      }))
    }
  });

  // define dom reference while extending
  if (options?.dom) {
    Extended.dom = options.dom;
  }

  // suppress the layout engine warning for instances
  if (options?.suppressLayoutEngineWarning) {
    Extended.suppressLayoutEngineWarning = options.suppressLayoutEngineWarning;
  }

  return Extended;
}
