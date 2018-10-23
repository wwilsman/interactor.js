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
function getPropertyDescriptor(instance, key) {
  let proto = instance;
  let descr;

  while (!descr && proto && proto !== Object.prototype) {
    descr = getOwnPropertyDescriptor(proto, key);
    proto = getPrototypeOf(proto);
  }

  return descr;
}

/**
 * Creates a property descriptor for interaction property getters.
 *
 * ``` javascript
 * function data(key, selector) {
 *   return computed(function() {
 *     return this.$(selector).dataset[key];
 *   })
 * }
 * ```
 *
 * ``` javascript
 * \@interactor class PageInteractor {
 *   username = data('user', '#user-info');
 * }
 * ```
 *
 * @function computed
 * @param {Function} getter - Property getter
 * @returns {Object} Property descriptor
 */
export function computed(getter) {
  return {
    enumerable: false,
    configurable: false,

    get() {
      // a validate function is supplied during `when` validations
      let [validate = () => {}] = arguments;
      return getter.call(this, validate);
    }
  };
}

/**
 * Creates a property descriptor for interaction methods.
 *
 * ``` javascript
 * function check(selector) {
 *   return action(function(name) {
 *     return this.click(`${selector}[name="${name}"]`);
 *   })
 * }
 * ```
 *
 * ``` javascript
 * \@interactor class CheckboxGroupInteractor {
 *   check = check('input[type="checkbox"]');
 * }
 * ```
 *
 * ``` javascript
 * new CheckboxGroupinteractor('.checkboxes').check('option-1');
 * ```
 *
 * @function action
 * @param {Function} method - Function body for the interaction method
 * @returns {Object} page-object property descriptor
 */
export function action(method) {
  return {
    enumerable: false,
    configurable: false,
    value: method
  };
}

/**
 * Given a string, will return a function that tests the truthiness of
 * an instance property. If the string starts with `!`, the validation
 * is inverted. Given a function, returns the function.
 *
 * @private
 * @param {Object} instance - Instance to check the property of
 * @param {String|Function|Array.<String|Function>} conditions -
 * Condition or conditions to check
 * @returns {Function} conditional function
 * @throws {Error} when the property condition is false
 */
export function conditional(instance, conditions) {
  return subject => {
    for (let condition of [].concat(conditions)) {
      // conditional function
      if (typeof condition === 'function') {
        if (condition(subject) === false) {
          throw new Error('Validation function returned false.');
        };

      // property validation
      } else if (typeof condition === 'string') {
        let negate = condition[0] === '!';
        let key = condition.substr(negate ? 1 : 0);

        // validation function passed to getter method
        let validate = (results, truthy, falsey = truthy) => {
          if (negate ? !!results : !results) {
            throw new Error(negate ? truthy : falsey);
          }
        };

        // validations are for computed properties only
        let { get } = getPropertyDescriptor(instance, key) || {};
        if (!get) throw new Error(`\`${key}\` is not a computed property.`);

        // validate the results of the getter
        let results = get.call(instance, validate);
        validate(results, `\`${key}\` is ${results}.`);
      }
    }

    // always curry the subject
    return subject;
  };
}
