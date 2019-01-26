import { validationFor } from '../utils/validation';

export function focusable(validate, element) {
  let result = ('tabIndex' in element) && element.tabIndex > -1;
  return validate(result, 'not focusable, tabindex must be greater than -1', 'focusable');
}

export default function isFocusable(selector) {
  return validationFor(selector, focusable);
}
