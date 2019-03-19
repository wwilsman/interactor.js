export default function value(selector, string) {
  if (!string) {
    string = selector;
    selector = null;
  }

  let actual = selector
    ? this.scoped(selector).value
    : this.value;
  let result = actual === string;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" ` : '') + (
        result
          ? `value is "${string}"`
          : `value is "${actual}" not "${string}"`
      )
    )
  };
};
