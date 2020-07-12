import error from '../error';

function isCheckboxNotRadio($el) {
  if ($el.type === 'radio') {
    throw error('%{@} is a radio button which cannot be unchecked');
  } else if ($el.type !== 'checkbox') {
    throw error('%{@} is not a checkbox');
  }
}

export default function uncheck() {
  return this
    .assert(isCheckboxNotRadio)
    .assert.not.disabled()
    .assert.checked()
    .exec($el => $el.click());
}
