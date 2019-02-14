import meta from './meta';
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
  let { scope, parent, detached } = interactor[meta];

  if (typeof scope === 'string') {
    return `"${scope}"`;
  } else if (typeof scope === 'undefined' && parent && !detached) {
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
  let messages = [];
  let subject;

  function getSubject(required) {
    return (subject = subject || (
      required ? interactor.$element : undefined
    ));
  }

  function buildError(key, expected, result) {
    let err = (!expected && messages[1]) || messages[0] || (
      `${key ? `\`${key}\` ` : ''}returned ${result}`
    );

    let message = format
      .replace('%s', getScopeName(interactor))
      .replace('%e', err);

    return new Error(message);
  }

  return function validate(predicate, ...msgs) {
    let key, result, error;
    let expected = true;

    if (isArray(predicate)) {
      return predicate.reduce((res, condition) => {
        messages = res ? [] : messages;
        return res && validate(condition, ...msgs);
      }, true);
    }

    if (messages.length === 0 && msgs.length > 0) {
      messages = msgs;
    }

    if (typeof predicate === 'string') {
      expected = predicate[0] !== '!';
      key = predicate.replace(/^!/, '');
      predicate = getComputedFn(interactor, key);
    }

    if (typeof predicate === 'function') {
      let subject = getSubject(predicate.length >= 2);

      try {
        result = predicate.call(interactor, validate, subject);
        result = typeof result === 'undefined' || !!result;
      } catch (err) {
        result = false;
        error = err;
      }
    }

    if (typeof predicate === 'boolean') {
      result = !!predicate;
    }

    let passed = result === expected;

    if (raise && !passed) {
      if (!messages[0] && error) throw error;
      throw buildError(key, expected, result);
    }

    return passed;
  };
}

export function validationFor(selector, predicate) {
  return validation(function(validate) {
    return predicate(validate, this.$(selector));
  });
}

export default function validation(...args) {
  return computed(function() {
    // when invoked as a predicate, this will already be provided
    let [validate = validator(this)] = arguments;
    return validate(...args);
  });
}
