export function q(strings, ...values) {
  return strings.reduce((str, string, i) => {
    return str + string + (
      typeof values[i] === 'string'
        ? `"${values[i]}"`
        : values[i]
    );
  }, '');
}
