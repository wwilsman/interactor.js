import computed from '../helpers/computed';

export default function focusable(selector) {
  return computed(
    selector,
    element => element.tabIndex > -1,
    actual => ({
      result: actual,
      message: () => (
        actual
          ? 'focusable'
          : 'not focusable, tabindex must be greater than -1'
      )
    })
  );
}
