export default function focusable() {
  let result = this.focusable;

  return {
    result,
    message: () => (
      result
        ? 'focusable'
        : 'not focusable, tabindex must be greater than -1'
    )
  };
};
