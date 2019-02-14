import validation from '../utils/validation';

export default function focused(selector) {
  return validation(function(validate, element) {
    element = this.$(selector || element);
    let result = element === document.activeElement;

    return validate(result, () => (
      `${selector ? `"${selector}" ` : ''}${result ? '' : 'not '}focused`
    ));
  });
}
