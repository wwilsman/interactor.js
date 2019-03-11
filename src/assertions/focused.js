export default function focused() {
  let result = this.focused;

  return {
    result,
    message: () => (
      `${result ? '' : 'not '}focused`
    )
  };
};
