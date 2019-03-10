export default {
  validate(string) {
    return this.text === string;
  },
  message(result, string) {
    return result
      ? `expected text not to equal "${string}"`
      : `expected text to equal "${string}" but recieved "${this.text}"`;
  }
};
