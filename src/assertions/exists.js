export default function exists() {
  let result = this.exists;

  return {
    result,
    message: () => (
      `${result ? 'exists' : 'does not exist'}`
    )
  };
};
