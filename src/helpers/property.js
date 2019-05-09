export function args(a) {
  return a.length <= 1 ? [undefined, a[0]] : a;
}

export default function property() {
  let [selector, prop] = args(arguments);
  return this.$(selector)[prop];
}
