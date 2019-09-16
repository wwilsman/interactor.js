import scoped from '../helpers/scoped';
import count from '../assertions/count';
import isInteractor from './is-interactor';
import createAsserts, { getAssertFor } from './assert';
import { chainAssert } from './chainable';
import meta, { set, get } from './meta';
import { sel, q, eq } from './string';

const {
  assign,
  defineProperties,
  entries,
  getOwnPropertyDescriptors,
  getOwnPropertyNames,
  getPrototypeOf,
  hasOwnProperty
} = Object;

const propertyBlacklist = [
  '$', '$$', '$dom', '$element', 'only', 'assert', meta,
  'timeout', 'when', 'always', 'do', 'append', 'run', 'then'
];

function checkForReservedPropertyNames(obj) {
  for (let key of getOwnPropertyNames(obj)) {
    if (propertyBlacklist.includes(key)) {
      throw new Error(`"${key}" is a reserved property name`);
    }
  }

  return obj;
}

function isPropertyDescriptor(obj) {
  return obj &&
    (hasOwnProperty.call(obj, 'get') ||
     hasOwnProperty.call(obj, 'value'));
}

function wrap(from) {
  return function() {
    let result = typeof from === 'function'
      ? from.apply(this, arguments)
      : from;

    /* istanbul ignore if: sanity check */
    if (!isInteractor(result)) {
      return result;
    } else if (get(result, 'queue').length > 0) {
      return this.do(function() {
        return set(result, { parent: this });
      });
    } else {
      return set(result, { parent: this, chain: true });
    }
  };
}

function descr({ value, get } = {}) {
  let d = { configurable: true, enumerable: false };
  return get ? assign(d, { get }) : assign(d, { value, writable: true });
}

function toInteractorDescriptor(from) {
  // already a property descriptor
  if (isPropertyDescriptor(from)) {
    // function descriptors still get wrapped
    if ('value' in from && typeof from.value === 'function') {
      return descr({ value: wrap(from.value) });
    } else {
      return descr(from);
    }

  // nested interactors get parent references
  } else if (isInteractor(from)) {
    // action interactors are functions
    if (get(from, 'queue').length > 0) {
      return descr({ value: wrap(from) });

    // all other interactors are getters
    } else {
      return descr({ get: wrap(from) });
    }

  // wrap functions in case they return interactors
  } else if (typeof from === 'function') {
    return descr({ value: wrap(from) });

  // preserve all other values
  } else {
    return descr({ value: from });
  }
}

function toInteractorAssertion(name, from) {
  // handle nested interactors
  if (isInteractor(from) && !get(from, 'queue').length) {
    return {
      get() {
        let assert = getAssertFor(this[meta][name]);
        return chainAssert(assert);
      }
    };

  // collection functions
  } else if (get(from, 'collection')) {
    let { scope } = from[meta];

    return {
      value(...args) {
        // given no arguments, return a single assertion method
        if (!args.length) {
          let ctx = this[meta];
          let parent = get(ctx, 'parent');

          let validate = function(expected) {
            return count.call(this, scope.call(this), expected);
          };

          let assert = {
            get not() {
              ctx = set(ctx, 'assert', { expected: false });
              return assert;
            },

            count(...args) {
              let { validations, expected } = get(ctx, 'assert');
              validations = validations.concat({ args, expected, validate });
              ctx = set(ctx, 'assert', { validations, expected: true });
              return parent ? parent.append(ctx) : ctx;
            }
          };

          return assert;

        // return a collection item's assertions
        } else {
          let assert = getAssertFor(this[meta][name](...args));
          return chainAssert(assert);
        }
      }
    };

  // computed property with a matcher
  } else if (get(from, 'matcher') || 'get' in from) {
    let { matcher, selector } = from[meta] || {};

    if (!matcher) {
      matcher = (...args) => {
        let [actual, expected] = args;
        let result = !!actual;

        if (args.length > 1) {
          result = eq(actual, expected);
        }

        return {
          result,
          message: () => result
            ? `\`${name}\` is ${q(actual)}`
            : `\`${name}\` is ${q(actual)} but expected ${q(expected)}`
        };
      };
    }

    // wrap computed matchers to preload with their computed value
    return function(...args) {
      let s, ctx;

      // allow an optional leading selector
      if (selector && args.length >= matcher.length) {
        [s, ...args] = args;
        ctx = set(scoped(s), { parent: this, chain: true });
      }

      ctx = ctx || this;

      // allow custom computed assertions
      let ret = (args.length === 1 && typeof args[0] === 'function')
        ? args[0].call(ctx, ctx[name])
        : matcher.call(ctx, ctx[name], ...args);

      if (!!ret && getPrototypeOf(ret) === Object.prototype) {
        return {
          result: ret.result,
          message: sel(s, ret.message)
        };
      }

      return ret;
    };

  // do nothing
  } else {
    return null;
  }
}

export function toInteractorProperties(properties) {
  return entries(getOwnPropertyDescriptors(
    checkForReservedPropertyNames(properties)
  )).reduce((props, [key, descr]) => {
    if (key === 'static') return props;

    // allow raw descriptors
    /* istanbul ignore next: sanity check */
    descr = 'value' in descr ? descr.value : descr;

    // check for attached assertions or computed getters
    if ((descr && descr[meta]) || (isPropertyDescriptor(descr) && 'get' in descr)) {
      let assertion = toInteractorAssertion(key, descr);
      if (assertion) assign(props.assertions, { [key]: assertion });
      if (!isInteractor(descr)) delete descr[meta];
    }

    // create interactor descriptor
    assign(props.descriptors, { [key]: toInteractorDescriptor(descr) });

    return props;
  }, { descriptors: {}, assertions: {} });
}

export default function from(properties) {
  let { assertions = {} } = properties.static || {};
  let staticProps = getOwnPropertyDescriptors(properties.static || {});
  let props = toInteractorProperties(properties);
  class CustomInteractor extends this {};

  // define properties from descriptors
  defineProperties(
    CustomInteractor.prototype,
    props.descriptors
  );

  // define static properties
  defineProperties(
    CustomInteractor,
    entries(staticProps).reduce((acc, [name, value]) => {
      if (name === 'assertions') return acc;
      if (!isPropertyDescriptor(value)) value = { value };
      if (isPropertyDescriptor(value.value)) ({ value } = value);
      return assign(acc, { [name]: value });
    }, {})
  );

  // define assertions
  defineProperties(CustomInteractor.prototype, {
    assert: {
      value: createAsserts(assign(
        props.assertions,
        isPropertyDescriptor(assertions)
          ? assertions.value
          : assertions
      ))
    }
  });

  return CustomInteractor;
}
