import computed from '../helpers/computed';

export default function focusable(selector) {
  return computed(
    selector,
    element => element.tabIndex > -1,
    actual => ({
      result: actual,
      message: () => (
        actual
          ? '%s is focusable'
          : '%s is not focusable, tabindex must be greater than -1'
      )
    })
  );
}
