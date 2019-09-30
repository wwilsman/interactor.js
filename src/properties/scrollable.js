import computed from '../helpers/computed';
import { hasLayoutEngine } from '../utils/dom';

function hasOverflowX(element) {
  return !hasLayoutEngine.call(this, 'Overflow as the result of CSS cannot be calculated') ||
    element.scrollWidth > element.clientWidth;
}

function hasOverflowY(element) {
  return !hasLayoutEngine.call(this, 'Overflow as the result of CSS cannot be calculated') ||
    element.scrollHeight > element.clientHeight;
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
    function(element) {
      return hasOverflowX.call(this, element) ||
        hasOverflowY.call(this, element);
    },
    actual => ({
      result: actual,
      message: () => (
        `%s ${actual ? 'has' : 'has no'} overflow`
      )
    })
  );
}
