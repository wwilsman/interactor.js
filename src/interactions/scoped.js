import interactor from '../decorator';
import { computed } from './helpers';

/**
 * Interaction creator for a single nested interactor.
 *
 * ``` html
 * <form class="login-form">
 *   <input type="text" name="username" />
 *   <input type="email" name="email" />
 *   <button type="submit">Login</button>
 * </form>
 * ```

 * ``` javascript
 * \@interactor class LoginFormInteractor {
 *   username = scoped('input[name="username"]')
 *   email = scoped('input[name="email"]')
 *   submit = clickable('button[type="submit"]')
 * }
 * ```
 *
 * Nested interactions return instances of the topmost interactor so
 * that the initial chain is never broken.
 *
 * ``` javascript
 * await loginForm
 *   .username.fill('darklord1926')
 *   .email.fill('tom.riddle@hogwarts.edu')
 *   .email.blur()
 *   .submit()
 * ```
 *
 * Nested interactors also have an additional method, `#only()`, which
 * disables the default nested chaining behavior, but retains any
 * previous interactions.
 *
 * ``` javascript
 * await loginForm
 *   .username.fill('h4x0r')
 *   .email.only()
 *     .fill('not@an@email')
 *     .blur()
 * ```
 *
 * With the second argument, you can define additional interactions
 * using the various interaction helpers.
 *
 * ``` html
 * <label class="field username-field">
 *   <span class="field-label">Username:</span>
 *   <input type="text" name="username" />
 * </label>
 * ```
 *
 * ``` javascript
 * \@interactor class FormInteractor {
 *   username = scoped('.username-field', {
 *     label: text('.field-label'),
 *     fillIn: fillable('input')
 *   })
 * }
 * ```
 *
 * You can also use another interactor class.
 *
 * ``` javascript
 * \@interactor class FieldInteractor {
 *   label = text('.field-label')
 *
 *   fillIn(value) {
 *     return this.scoped('input')
 *      .focus().fill(value).blur()
 *   }
 * }
 *
 * \@interactor class LoginFormInteractor {
 *   username = scoped('.username-field', FieldInteractor)
 *   email = scoped('.email-field', FieldInteractor)
 *   submit = clickable('button[type="submit"]')
 * }
 * ```
 *
 * ``` javascript
 * await loginForm
 *   .username.fillIn('darklord1926')
 *   .email.fillIn('tom.riddle@hogwarts.edu')
 *   .submit()
 * ```
 *
 * @function scoped
 * @param {String} selector - Element query selector
 * @param {Object} [descriptors] - Interaction descriptors
 * @returns {Object} Property descriptor
 */
export default function(selector, descriptors = {}) {
  let ScopedInteractor = interactor(descriptors);

  return computed(function() {
    return new ScopedInteractor({
      parent: this,
      scope: () => this.$(selector)
    });
  });
}
