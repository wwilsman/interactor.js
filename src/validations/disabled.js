import validation from '../utils/validation';

export default function disabled(selector) {
  return validation(function(validate, element) {
    element = this.$(selector || element);
    let result = ('disabled' in element) && element.disabled;

    return validate(result, () => (
      `${selector ? `"${selector}" ` : ''}${result ? '' : 'not '}disabled`
    ));
  });
}
