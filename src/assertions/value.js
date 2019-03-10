export default {
  validate(string) {
    return this.value === string;
  },
  message(result, string) {
    return result
      ? `expected value not to equal "${string}"`
      : `expected value to equal "${string}" but recieved "${this.value}"`;
  }
};
