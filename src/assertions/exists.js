export default function exists(selector) {
  let result = selector
    ? this.scoped(selector).exists
    : this.exists;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" ` : '') + (
        result ? 'exists' : 'does not exist'
      )
    )
  };
};
