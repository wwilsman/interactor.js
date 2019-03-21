import isInteractor from './is-interactor';
import createAsserts from './assert';
import meta, { set, get } from './meta';

const {
  assign,
  defineProperties,
  entries,
  getOwnPropertyDescriptors,
  getOwnPropertyNames,
  hasOwnProperty
} = Object;

const propertyBlacklist = [
  '$', '$$', '$element', 'only', 'assert', meta,
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

export function wrap(from) {
  return function() {
    let result = typeof from === 'function'
      ? from.apply(this, arguments)
      : from;

    /* istanbul ignore if: sanity check */
    if (!isInteractor(result)) {
      return result;
    } else if (get(result, 'queue').length > 0) {
      return this.do(() => set(result, { parent: this }));
    } else {
      return set(result, { parent: this, chain: true });
    }
  };
}

function toInteractorDescriptor(from) {
  // already a property descriptor
  if (isPropertyDescriptor(from)) {
    // simple values may still need to be transformed
    if ('value' in from) {
      return toInteractorDescriptor(from.value);
    } else {
      return from;
    }

  // nested interactors get parent references
  } else if (isInteractor(from)) {
    // action interactors are functions
    if (get(from, 'queue').length > 0) {
      return { value: wrap(from) };

    // all other interactors are getters
    } else {
      return { get: wrap(from) };
    }

  // wrap functions in case they return interactors
  } else if (typeof from === 'function') {
    return { value: wrap(from) };

  // preserve all other values
  } else {
    return { value: from };
  }
}

export default function from(properties) {
  let {
    static: {
      assertions = {},
      ...staticProps
    } = {},
    ...ownProps
  } = properties;

  class CustomInteractor extends this {};

  // define properties from descriptors
  defineProperties(
    CustomInteractor.prototype,
    checkForReservedPropertyNames(
      entries(getOwnPropertyDescriptors(ownProps))
        .reduce((acc, [key, descr]) => assign(acc, {
          [key]: toInteractorDescriptor(descr)
        }), {})
    )
  );

  // define static properties
  defineProperties(
    CustomInteractor,
    getOwnPropertyDescriptors(staticProps)
  );

  // define assertions
  defineProperties(CustomInteractor.prototype, {
    assert: {
      value: createAsserts(assertions)
    }
  });

  return CustomInteractor;
}
