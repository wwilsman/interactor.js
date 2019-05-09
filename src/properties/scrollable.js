import computed from '../helpers/computed';

function hasOverflowX(element) {
  return element.scrollWidth > element.clientWidth;
}

function hasOverflowY(element) {
  return element.scrollHeight > element.clientHeight;
}

export function scrollableX(selector) {
  return computed(
    selector,
    hasOverflowX,
    actual => ({
      result: actual,
      message: () => (
        `%s ${actual ? 'has' : 'has no'} overflow-x`
      )
    })
  );
}

export function scrollableY(selector) {
  return computed(
    selector,
    hasOverflowY,
    actual => ({
      result: actual,
      message: () => (
        `%s ${actual ? 'has' : 'has no'} overflow-y`
      )
    })
  );
}

export default function scrollable(selector) {
  return computed(
    selector,
    element => (
      hasOverflowX(element) || hasOverflowY(element)
    ),
    actual => ({
      result: actual,
      message: () => (
        `%s ${actual ? 'has' : 'has no'} overflow`
      )
    })
  );
}
