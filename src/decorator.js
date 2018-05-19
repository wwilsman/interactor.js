import Convergence from '@bigtest/convergence';
import Interactor from './interactor';
import { isInteractor, isPropertyDescriptor } from './utils';

/**
 * Throws an error if an object contains reserved properties. Reserved
 * properties are convergence prototype properties.
 *
 * @private
 * @param {Object} obj - Object to check for reserved properties
 * @throws {Error} if any reserverd properties were found
 */
function checkForReservedProperties(obj) {
  let blacklist = Object.getOwnPropertyNames(Convergence.prototype);

  for (let key of Object.keys(obj)) {
    if (blacklist.includes(key)) {
      throw new Error(`"${key}" is a reserved property name`);
    }
  }
}

/**
 * ``` javascript
 * import { interactor } from '@bigtest/interactor';
 * ```
 *
 * Creates a custom interactor class from methods and properties of
 * another class. Instance initializers that define property
 * descriptors will have their descriptors added to the custom class's
 * prototype.
 *
 * ``` javascript
 * import {
 *   interactor,
 *   isPresent,
 *   clickable
 * } from '@bigtest/interactor';
 *
 * \@interactor class CustomInteractor {
 *   // optional default scope for this interactor
 *   static defaultScope = '#some-element'
 *
 *   // `isPresent` returns a getter descriptor
 *   hasError = isPresent('div.error')
 *
 *   // `*able` helpers return method descriptors
 *   submit = clickable('button[type="submit"]')
 *
 *   // normal getters and methods work as well
 *   fillForm(name, email) {
 *     return this
 *       .fill('input#name', name)
 *       .fill('input#email', email)
 *       .submit()
 *   }
 * }
 * ```
 *
 * @function interactor
 * @param {Class} Class - The class to decorate
 * @returns {Class} Custom interactor class
 */
export default function interactor(Class) {
  let CustomInteractor = class extends Interactor {};
  let proto = Object.getOwnPropertyDescriptors(Class.prototype);

  // check instance properties for property descriptors
  for (let [key, value] of Object.entries(new Class())) {
    if (isPropertyDescriptor(value)) {
      proto[key] = value;

    // nested interactions need to return their parent
    } else if (isInteractor(value)) {
      proto[key] = {
        get() {
          return new value.constructor({
            parent: this
          }, value);
        }
      };

    // preserve other values
    } else {
      proto[key] = { value };
    }
  }

  // remove the constructor and check for reserved properties
  delete proto.constructor;
  checkForReservedProperties(proto);

  // extend the custom interactor's prototype
  Object.defineProperties(CustomInteractor.prototype, proto);
  Object.defineProperty(CustomInteractor, 'name', { value: Class.name });

  // if a default scope was defined, use it
  if (Class.defaultScope) {
    Object.defineProperty(CustomInteractor, 'defaultScope', { value: Class.defaultScope });
  }

  return CustomInteractor;
}
