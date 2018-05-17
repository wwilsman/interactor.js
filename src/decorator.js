import Convergence from '@bigtest/convergence';
import Interactor from './interactor';
import { isInteractor, isPropertyDescriptor } from './utils';

/**
 * Returns property descriptors of an instance and any other defined
 * properties that look like property descriptors. If an interactor is
 * encountered, it is configured to return the parent instance. The
 * returned descriptors are meant to be used with custom interactors.
 *
 * @private
 * @param {Object} instance - Instance used for collecting descriptors
 * @returns {Object} - Property descriptors
 */
function getInteractorDescriptors(instance) {
  let descriptors = Object.getOwnPropertyDescriptors(instance);

  // check instance properties for property descriptors
  for (let [key, value] of Object.entries(instance)) {
    if (isPropertyDescriptor(value)) {
      descriptors[key] = value;

    // nested interactions need to return their parent
    } else if (isInteractor(value)) {
      descriptors[key] = {
        get() {
          return new value.constructor({
            parent: this
          }, value);
        }
      };

    // preserve other values
    } else {
      descriptors[key] = { value };
    }
  }

  return descriptors;
}

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
 * @param {Class} Class - Used for creating custom interactions
 * @returns {Class} Custom interactor class
 */
export default function interactor(from) {
  let CustomInteractor = class extends Interactor {};
  let proto = Object.create(null);

  // the class is already an interactor
  if (from.prototype instanceof Interactor) {
    return from;
  }

  // a descriptor object was provided
  if (Object.getPrototypeOf(from) === Object.prototype) {
    proto = Object.getOwnPropertyDescriptors(from);
    Object.assign(proto, getInteractorDescriptors(from));

  // a class was provided
  } else if (typeof from === 'function') {
    proto = Object.getOwnPropertyDescriptors(from.prototype);
    Object.assign(proto, getInteractorDescriptors(new from())); // eslint-disable-line new-cap

    // preserve static class properties
    Object.defineProperties(CustomInteractor, {
      name: { value: from.name },
      defaultScope: { value: from.defaultScope || Interactor.defaultScope }
    });
  }

  // remove the constructor and check for reserved properties
  delete proto.constructor;
  checkForReservedProperties(proto);

  // extend the custom interactor's prototype and return it
  Object.defineProperties(CustomInteractor.prototype, proto);
  return CustomInteractor;
}
