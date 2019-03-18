import scoped from '../helpers/scoped';
import { dispatch } from './trigger';

function isCheckboxOrRadio() {
  let element = this.$element;

  if (element.tagName.toLowerCase() !== 'input') {
    throw new Error('not an input element');
  } else if (element.type !== 'checkbox' && element.type !== 'radio') {
    throw new Error('not a checkbox or radio button');
  } else if (element.disabled) {
    throw new Error('disabled');
  }
}

export function uncheck(selector) {
  return scoped(selector)
    .assert(isCheckboxOrRadio)
    .assert.f('Failed to uncheck %s: %e')
    .do(element => {
      element.checked = false;
      dispatch(element, 'input', { cancelable: false });
      dispatch(element, 'change', { cancelable: false });
    });
}

export default function check(selector) {
  return scoped(selector)
    .assert(isCheckboxOrRadio)
    .assert.f('Failed to check %s: %e')
    .do(element => {
      element.checked = true;
      dispatch(element, 'input', { cancelable: false });
      dispatch(element, 'change', { cancelable: false });
    });
}
