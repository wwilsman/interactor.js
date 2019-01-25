import { validationFor } from '../utils/validation';

export function disabled(validate, element) {
  let result = ('disabled' in element) && element.disabled;
  return validate(result, 'not disabled', 'disabled');
}

export default function isDisabled(selector) {
  return validationFor(selector, disabled);
}
