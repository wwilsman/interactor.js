export default {
  validate() {
    return this.focusable;
  },
  message(result) {
    return result
      ? 'focusable'
      : 'not focusable, tabindex must be greater than -1';
  }
};
