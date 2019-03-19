export default function focusable(selector) {
  let result = selector
    ? this.scoped(selector).focusable
    : this.focusable;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" is ` : '') + (
        result ? 'focusable' : 'not focusable, tabindex must be greater than -1'
      )
    )
  };
};
