export default {
  validate() {
    return this.disabled;
  },
  message(result) {
    return `${result ? '' : 'not '}disabled`;
  }
};
