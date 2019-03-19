export default function text(selector, string) {
  if (!string) {
    string = selector;
    selector = null;
  }

  let actual = selector
    ? this.scoped(selector).text
    : this.text;
  let result = actual === string;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" ` : '') + (
        result
          ? `text is "${string}"`
          : `text is "${actual}" not "${string}"`
      )
    )
  };
};
