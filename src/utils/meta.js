const symbol = Symbol('meta');

export function get(instance, key) {
  let meta = instance && instance[symbol];
  return (meta && key) ? meta[key] : meta;
}

export function set(instance, options) {
  return new instance.constructor(options, instance);
}

export default symbol;
