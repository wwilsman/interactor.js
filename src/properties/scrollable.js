import computed from '../helpers/computed';

function hasOverflowX(element) {
  return element.scrollWidth > element.clientWidth;
}

function hasOverflowY(element) {
  return element.scrollHeight > element.clientHeight;
}

export function scrollableX(selector) {
  return computed(selector, hasOverflowX);
}

export function scrollableY(selector) {
  return computed(selector, hasOverflowY);
}

export default function scrollable(selector) {
  return computed(selector, element => (
    hasOverflowX(element) || hasOverflowY(element)
  ));
}
