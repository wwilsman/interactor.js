export default function disabled(selector) {
  let result = selector
    ? this.scoped(selector).disabled
    : this.disabled;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" is ` : '') + (
        `${result ? '' : 'not '}disabled`
      )
    )
  };
};
