import validation from '../utils/validation';

export default function exists(selector) {
  return validation(function(validate) {
    let result = false;

    try {
      result = !!this.$(selector);
    } catch (e) {
      result = false;
    }

    return validate(result, () => (
      `${selector ? `"${selector}" ` : ''}${result ? 'exists' : 'does not exist'}`
    ));
  });
}
