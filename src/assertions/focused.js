export default {
  validate() {
    return this.focused;
  },
  message(result) {
    return `${result ? '' : 'not '}focused`;
  }
};
