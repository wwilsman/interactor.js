export default function text(string) {
  let actual = this.text;
  let result = actual === string;

  return {
    result,
    message: () => (
      result
        ? `text is "${string}"`
        : `text is "${actual}" not "${string}"`
    )
  };
};
