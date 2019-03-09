export default function exists() {
  return {
    validate() {
      return this.exists;
    },
    message(result) {
      return `${result ? 'exists' : 'does not exist'}`;
    }
  };
}
