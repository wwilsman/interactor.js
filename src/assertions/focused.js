export default function focused(selector) {
  let result = selector
    ? this.scoped(selector).focused
    : this.focused;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" is ` : '') + (
        `${result ? '' : 'not '}focused`
      )
    )
  };
};
