import scoped from '../helpers/scoped';

function isCheckboxOrRadio(element) {
  if (element.type !== 'checkbox' && element.type !== 'radio') {
    throw new Error('not a checkbox or radio button');
  }
}

function isCheckboxNotRadio(element) {
  if (element.type === 'radio') {
    throw new Error('radio buttons cannot be unchecked');
  } else if (element.type !== 'checkbox') {
    throw new Error('not a checkbox');
  }
}

export function uncheck(selector) {
  return scoped(selector)
    .assert(isCheckboxNotRadio)
    .assert.not.disabled()
    .assert.checked()
    .assert.f('Failed to uncheck %s: %e')
    .do(element => {
      element.click();
    });
}

export default function check(selector) {
  return scoped(selector)
    .assert(isCheckboxOrRadio)
    .assert.not.disabled()
    .assert.not.checked()
    .assert.f('Failed to check %s: %e')
    .do(element => {
      element.click();
    });
}
