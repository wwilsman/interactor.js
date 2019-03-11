export default function value(string) {
  let actual = this.value;
  let result = actual === string;

  return {
    result,
    message: () => (
      result
        ? `value is "${string}"`
        : `value is "${actual}" not "${string}"`
    )
  };
};
