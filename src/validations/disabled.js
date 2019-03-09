export default function disabled() {
  return {
    validate() {
      return this.disabled;
    },
    message(result) {
      return `${result ? '' : 'not '}disabled`;
    }
  };
}
