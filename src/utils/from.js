import Interactor from '../interactor';
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

function toInteractorDescriptor(from) {
  // already a property descriptor
  if (isPropertyDescriptor(from)) {
    return from;

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

function toInteractorAssertion(name, from) {
  if (isInteractor(from) && !get(from, 'queue').length) {
    return {
      get() {
        return this[meta][name].assert;
      }
    };
  } else if (get(from, 'collection')) {
    return {
      value(...args) {
        return this[meta][name](...args).assert;
      }
    };
  } else if (get(from, 'matcher')) {
    let { matcher } = from[meta];

    return function(...args) {
      return matcher.call(this, this[name], ...args);
    };
  } else {
    return null;
  }
}

export function toInteractorProperties(properties) {
  return entries(getOwnPropertyDescriptors(
    checkForReservedPropertyNames(properties)
  )).reduce((props, [key, descr]) => {
    // allow raw descriptors
    /* istanbul ignore next: sanity check */
    descr = 'value' in descr ? descr.value : descr;

    // check for attached assertions
    if (descr[meta]) {
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
  let {
    static: {
      assertions = {},
      ...staticProps
    } = {},
    ...ownProps
  } = properties;

  let props = toInteractorProperties(ownProps);
  let Parent = this.prototype instanceof Interactor
    ? this.prototype.constructor
    : Interactor;

  class CustomInteractor extends Parent {};

  // define properties from descriptors
  defineProperties(
    CustomInteractor.prototype,
    props.descriptors
  );

  // define static properties
  defineProperties(
    CustomInteractor,
    getOwnPropertyDescriptors(staticProps)
  );

  // define assertions
  defineProperties(CustomInteractor.prototype, {
    assert: {
      value: createAsserts({
        ...props.assertions,
        ...assertions
      })
    }
  });

  return CustomInteractor;
}
