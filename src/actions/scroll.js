import error from '../error';
import { dispatch } from '../dom';

export default function scroll(options = {}) {
  let next = this;

  let {
    top = options.y,
    left = options.x,
    wheel = false,
    frequency = 1
  } = options;

  if (top == null && left == null) {
    throw error('missing scroll direction');
  }

  if (left != null) {
    next = next.assert.scrollableX();
  }

  if (top != null) {
    next = next.assert.scrollableY();
  }

  return next.exec($el => {
    for (let i = 1; i <= frequency; i++) {
      let cancelled = false;

      if (wheel) {
        cancelled = !dispatch($el, 'wheel', {});
      }

      if (!cancelled) {
        if (top) $el.scrollTop = (top / frequency) * i;
        if (left) $el.scrollLeft = (left / frequency) * i;
        dispatch($el, 'scroll', { cancelable: false });
      }
    }
  });
}
