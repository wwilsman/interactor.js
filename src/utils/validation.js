import { get } from './meta';
import computed from './computed';

const {
  isArray
} = Array;
const {
  getOwnPropertyDescriptor,
  getPrototypeOf
} = Object;

function getComputedFn(instance, key) {
  let proto = instance;
  let descr;

  while (!descr && proto && proto !== Object.prototype) {
    descr = getOwnPropertyDescriptor(proto, key);
    proto = getPrototypeOf(proto);
  }

  if (!(descr && descr.get)) {
    throw new Error(`\`${key}\` is not a computed property.`);
  }

  return descr.get;
}

function getScopeName(interactor) {
  let { scope, parent, detached } = get(interactor);

  if (typeof scope === 'string') {
    return `"${scope}"`;
  } else if (scope == null && parent && !detached) {
    return getScopeName(parent);
  } else {
    return interactor.constructor.name;
  }
}

export function validator(
  interactor,
  raise = false,
  format = '%s validation failed: %e'
) {
  let message, subject;

  function getSubject(required) {
    return (subject = subject || (
      required ? interactor.$element : undefined
    ));
  }

  function buildError(key, result) {
    let err = message
      ? typeof message === 'function' ? message(result) : message
      : `${key ? `\`${key}\` ` : ''}returned ${result}`;

    return new Error(
      format
        .replace('%s', getScopeName(interactor))
        .replace('%e', err)
    );
  }

  return function validate(predicate, err) {
    let key, result, error;
    let expected = true;

    // array of predicates
    if (isArray(predicate)) {
      return predicate.reduce((res, condition) => {
        message = res ? null : message;
        return res && validate(condition, err);
      }, true);
    }

    // set the error message
    message = message || err;

    // get a validation function and possibly negate the expectation
    if (typeof predicate === 'string') {
      expected = predicate[0] !== '!';
      key = predicate.replace(/^!/, '');
      predicate = getComputedFn(interactor, key);
    }

    // run the validation
    if (typeof predicate === 'function') {
      let subject = getSubject(predicate.length >= 2);

      try {
        result = predicate.call(interactor, validate, subject);
        result = typeof result === 'undefined' || !!result;
      } catch (e) {
        result = false;
        error = e;
      }
    } else {
      // coerse to a booleann
      result = !!predicate;
    }

    // determine if the result is expected
    let passed = result === expected;

    // raise an error
    if (raise && !passed) {
      if (!message && error) throw error;
      throw buildError(key, result);
    }

    // return the final result
    return passed;
  };
}

export default function validation(...args) {
  return computed(function() {
    // when invoked as a predicate, this will already be provided
    let [validate = validator(this)] = arguments;
    return validate(...args);
  });
}
