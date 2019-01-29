import { validationFor } from '../utils/validation';

export function focused(validate, element) {
  let result = element === document.activeElement;
  return validate(result, 'not focused', 'focused');
}

export default function isFocused(selector) {
  return validationFor(selector, focused);
}
