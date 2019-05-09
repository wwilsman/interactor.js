export function args(a) {
  return a.length <= 1 ? [undefined, a[0]] : a;
}

export default function attribute() {
  let [selector, attr] = args(arguments);
  return this.$(selector).getAttribute(attr);
}
