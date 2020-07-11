import error from '../error';

function isCheckboxOrRadio($el) {
  if ($el.type !== 'checkbox' && $el.type !== 'radio') {
    throw error('%{@} is not a checkbox or radio button');
  }
}

export default function check() {
  return this
    .assert(isCheckboxOrRadio)
    .assert.not.disabled()
    .assert.not.checked()
    .exec($el => $el.click());
}
