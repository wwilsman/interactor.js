/* global Event */
import { action } from './helpers';
import { find } from './find';

/**
 * Converges on an element first existing in the DOM, then selects a
 * matching option based on the text content, and triggers `change`
 * and `input` events for the select element.
 *
 * ``` html
 * <form ...>
 *   <select id="month">
 *     <option value="1">January</option>
 *     <option value="2">February</option>
 *     <option value="3">March</option>
 *     ...
 *   </select>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * await new Interactor('select').select('February')
 * await new Interactor('form').fill('select#month', 'March')
 * ```
 *
 * @method Interactor#select
 * @param {String} [selector] - Nested element query selector
 * @param {String} option - Option text to select
 * @returns {Interactor} A new instance with additional convergences
 */
export function select(selectorOrOption, option) {
  let selector;

  // if option is not defined, it is assumed that the only passed
  // argument is the option for the root element
  if (typeof option === 'undefined') {
    option = selectorOrOption;
  } else {
    selector = selectorOrOption;
  }

  return find.call(this, selector)
    .when(($select) => {
      // find the option by text content
      for (let $option of $select.options) {
        if ($option.text === option) {
          return [$select, $option];
        }
      }

      throw new Error(`unable to find option "${option}"`);
    })
    .do(([$select, $option]) => {
      // select the option
      $option.selected = true;

      // dispatch input event
      $select.dispatchEvent(
        new Event('input', {
          bubbles: true,
          cancelable: true
        })
      );

      // dispatch change event
      $select.dispatchEvent(
        new Event('change', {
          bubbles: true,
          cancelable: true
        })
      );
    });
}

/**
 * Interaction creator for selecting an option of a specific select
 * element within a custom interactor class.
 *
 * ``` html
 * <form ...>
 *   <select id="month">
 *     <option value="1">January</option>
 *     <option value="2">February</option>
 *     <option value="3">March</option>
 *     ...
 *   </select>
 *   ...
 * </form>
 * ```
 *
 * ``` javascript
 * \@interactor class FormInteractor {
 *   selectMonth = selectable('select#month')
 * }
 * ```
 *
 * ``` javascript
 * await new FormInteractor('form').selectMonth('February')
 * ```
 *
 * @function selectable
 * @param {String} selector - Element query selector
 * @returns {Object} Property descriptor
 */
export default function(selector) {
  return action(function(option) {
    return select.call(this, selector, option);
  });
}
