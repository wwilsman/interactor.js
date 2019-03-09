export default function focused() {
  return {
    validate() {
      return this.focused;
    },
    message(result) {
      return `${result ? '' : 'not '}focused`;
    }
  };
}
