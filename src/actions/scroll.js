import scoped from '../properties/scoped';
import isInteractor from '../utils/is-interactor';

function scroll(selector, {
  x, y,
  top = y,
  left = x,
  wheel = false,
  frequency = 1
} = {}) {
  if (top == null && left == null) {
    throw new Error('missing scroll direction');
  }

  return scoped(selector)
    .validate(
      top == null ? 'scrollableX'
        : left == null ? 'scrollableY'
          : 'scrollable',
      'Failed to scroll %s: %e'
    )
    .do(element => {
      for (let i = 1; i <= frequency; i++) {
        let cancelled = false;

        if (wheel) {
          cancelled = !element.dispatchEvent(
            new Event('wheel', {
              bubbles: true,
              cancelable: true
            })
          );
        }

        /* istanbul ignore else: unnecessary */
        if (!cancelled) {
          if (top) element.scrollTop = (top / frequency) * i;
          if (left) element.scrollLeft = (left / frequency) * i;

          element.dispatchEvent(
            new Event('scroll', {
              bubbles: true,
              cancelable: true
            })
          );
        }
      }
    });
}

export default function(selector, options) {
  if (typeof selector !== 'string') {
    options = selector;
    selector = null;
  }

  return (options || isInteractor(this))
    ? scroll(selector, options)
    : options => scroll(selector, options);
}
