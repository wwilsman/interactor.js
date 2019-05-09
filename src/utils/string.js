export function sel(selector, message) {
  return () => message()
    .replace('%s', selector ? `"${selector}"` : '')
    .trim();
}

export function q(value) {
  return typeof value === 'string'
    ? `"${value}"`
    : value;
}
