import { action, conditional } from './helpers';

/**
 * Converges on a condition. When the condition is a string, an
 * instance property is checked for a truthy value. If the string
 * starts with an `!`, the validation is inverted. Given a function,
 * will converge when the function does not error or return false.
 *
 * ``` javascript
 * \@interactor class ButtonInteractor {
 *   isLoading = hasClass('.is-loading');
 * }
 * ```
 *
 * ``` javascript
 * // waits until not in a loading state before clicking
 * await new ButtonInteractor()
 *   .validate('!isLoading')
 *   .click()
 * ```
 *
 * @method Interactor#validate
 * @param {String|Function|Array.<String|Function>} conditions - One
 * or more property names or functions to converge on
 * @returns {Interactor} A new instance with additional convergences
 */
export function validate(conditions) {
  return this.when(conditional(this, conditions));
}

/**
 * Interaction creator for converging on a condition.
 *
 * ``` javascript
 * \@interactor class ButtonInteractor {
 *   isLoading = hasClass('.is-loading');
 *   doneLoading = validate('!isLoading');
 * }
 * ```
 *
 * ``` javascript
 * // waits until not in a loading state before clicking
 * await new ButtonInteractor()
 *   .doneLoading()
 *   .click()
 * ```
 *
 * @function validate
 * @param {String|Function|Array.<String|Function>} conditions -
 * Property name or function to converge on
 * @returns {Object} Property Descriptor
 */
export default function(conditions) {
  return action(function() {
    return validate.call(this, conditions);
  });
}
