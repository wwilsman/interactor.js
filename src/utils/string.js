export function sel(selector, message) {
  return result => message(result)
    .replace('%s', selector ? `"${selector}"` : '')
    .trim();
}

export function q(value) {
  return typeof value === 'string'
    ? `"${value}"`
    : value;
}

export function eq(actual, expected) {
  if (typeof actual === 'string' && expected instanceof RegExp) {
    return expected.test(actual);
  } else {
    return actual === expected;
  }
}
