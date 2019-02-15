import validation from '../utils/validation';

function hasOverflowX(element) {
  return element.scrollWidth > element.clientWidth;
}

function hasOverflowY(element) {
  return element.scrollHeight > element.clientHeight;
}

export function scrollableX(selector) {
  return validation(function(validate, element) {
    element = this.$(selector || element);
    let result = hasOverflowX(element);

    return validate(result, () => (
      `${selector ? `"${selector}" ` : ''}${result ? 'has' : 'no'} overflow-x`
    ));
  });
}

export function scrollableY(selector) {
  return validation(function(validate, element) {
    element = this.$(selector || element);
    let result = hasOverflowY(element);

    return validate(result, () => (
      `${selector ? `"${selector}" ` : ''}${result ? 'has' : 'no'} overflow-y`
    ));
  });
}

export default function scrollable(selector) {
  return validation(function(validate, element) {
    element = this.$(selector || element);
    let result = hasOverflowX(element) || hasOverflowY(element);

    return validate(result, () => (
      `${selector ? `"${selector}" ` : ''}${result ? 'has' : 'no'} overflow`
    ));
  });
}
