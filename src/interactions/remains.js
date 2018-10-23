import { action, conditional } from './helpers';

/**
 * Converges on a condition always passing for a period of time. When
 * the condition is a string, an instance property is checked for a
 * truthy value. If the string starts with an `!`, the validation is
 * inverted. Given a function, will converge if the function does
 * not error or return false throughout the timeout period.
 *
 * ``` javascript
 * \@interactor class ButtonInteractor {
 *   isLoading = hasClass('.is-loading');
 * }
 * ```
 *
 * ``` javascript
 * // ensures it is not loading for at least 100ms before clicking
 * await new ButtonInteractor()
 *   .remains('!isLoading', 100)
 *   .click()
 * ```
 *
 * @method Interactor#remains
 * @param {String|Function|Array.<String|Function>} conditions - One or
 * more property names or functions to converge on throughout the timeout
 * @param {Number} [timeout] - Timeout to converge on
 * @returns {Interactor} A new instance with additional convergences
 */
export function remains(conditions, timeout) {
  return this.always(conditional(this, conditions), timeout);
}

/**
 * Interaction creator for converging on a condition being true for a
 * period of time. The resulting method accepts a timeout which
 * overrides any timeout provided to the creator.
 *
 * ``` javascript
 * \@interactor class ButtonInteractor {
 *   isLoading = hasClass('.is-loading');
 *   notLoading = remains('!isLoading', 100);
 * }
 * ```
 *
 * ``` javascript
 * // ensures not in a loading state for 100ms before clicking
 * await new ButtonInteractor()
 *   .notLoading()
 *   .click()
 *
 * // uses 1000ms instead of 100ms
 * await new ButtonInteractor()
 *   .notLoading(1000)
 *   .click()
 * ```
 *
 * @function remains
 * @param {String|Function|Array.<String|Function>} conditions -
 * Property name or function to converge on throughout the timeout
 * @param {Number} [defualtTimeout] - Default timeout to use
 * @returns {Object} Property Descriptor
 */
export default function(conditions, defaultTimeout) {
  return action(function(timeout = defaultTimeout) {
    return remains.call(this, conditions, timeout);
  });
}
