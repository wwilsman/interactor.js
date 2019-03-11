export default function disabled() {
  let result = this.disabled;

  return {
    result,
    message: () => (
      `${result ? '' : 'not '}disabled`
    )
  };
};
