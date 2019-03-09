import scoped from '../helpers/scoped';

export default function scroll(selector, options = {}) {
  if (typeof selector !== 'string') {
    options = selector || {};
    selector = null;
  }

  let {
    top = options.y,
    left = options.x,
    wheel = false,
    frequency = 1
  } = options;

  if (top == null && left == null) {
    throw new Error('missing scroll direction');
  }

  let interactor = scoped(selector);

  if (top == null) {
    interactor = interactor.assert.scrollableX();
  } else if (left == null) {
    interactor = interactor.assert.scrollableY();
  } else {
    interactor = interactor.assert.scrollable();
  }

  return interactor
    .assert.f('Failed to scroll %s: %e')
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
