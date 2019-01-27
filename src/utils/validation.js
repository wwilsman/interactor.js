import meta from './meta';
import computed from './computed';

const {
  isArray
} = Array;
const {
  getOwnPropertyDescriptor,
  getPrototypeOf
} = Object;

/**
 * Returns a property descriptor found on an instance or on the
 * instance's prototype chain.
 *
 * @private
 * @param {Object} instance
 * @param {String} key
 * @returns {Object}
 */
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

/**
 * Returns the interactor's scope string or constructor name if the
 * scope is not a string.
 *
 * @private
 * @param {Interactor} interactor
 * @returns {String}
 */
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

/**
 * Creates a validate function bound to an interactor instance.
 *
 * If the `raise` option is true, an error will be thrown instead of
 * returning false. The error message is generated using the `format`
 * option, where `%s` is the interactor's scope or name and `%e` is
 * the error message provided by the validation that failed.
 *
 * @private
 * @param {Boolean} [options.raise]
 * @param {String} [options.format]
 * @returns {Function}
 */
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

/**
 *
 *
 * @param {} selector
 * @param {} predicate
 * @returns {}
 */
export function validationFor(selector, predicate) {
  return validation(function(validate) {
    return predicate(validate, this.$(selector));
  });
}

/**
 * Creates a computed validation property. The predicate function
 * recieves a validate function and optionally the element being
 * validated against. If the element does not exist, an error will be
 * thrown before the predicate is invoked. When there is no second
 * argument to the predicate function, the element getter will not be
 * accessed and no error will be raised.
 *
 * The validate function provided to the predicate accepts a boolean,
 * a property string, another predicate function, or a mixed array and
 * returns true or false if it passes validation. Strings are treated
 * as other validation property keys and can be negated by prefixing
 * the key with `!`.
 *
 * When using the `#validate()` method, an error will be thrown
 * instead of returning false. The error message is generated from the
 * second argument given to the validation function. If a third
 * argument is provided, it will be used when the validation is
 * negated with `!`.
 *
 * ```javascript
 * \@interactor class FooBarInteractor {
 *   foo = validation((validate, element) => {
 *     let isFoo = element.classList.contains('foo');
 *     return validate(isFoo, 'not foo', 'is foo');
 *   });
 * }
 *
 * // ...
 *
 * let bar = new FooBarInteractor('.bar');
 *
 * // boolean getter
 * expect(bar.foo).toBe(false);
 *
 * // convergent assertion
 * await bar.validate('foo');
 * //=> Error: ".bar" validation failed: not foo
 * ```
 *
 * @param {Function} predicate - computed predicate function
 * @returns {Object} computed property descriptor
 */
export default function validation(...args) {
  return computed(function() {
    // when invoked as a predicate, this will already be provided
    let [validate = validator(this)] = arguments;
    return validate(...args);
  });
}
