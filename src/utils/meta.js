const symbol = Symbol('meta');

export function get(instance, key) {
  let meta = instance && instance[symbol];
  return (meta && key) ? meta[key] : meta;
}

export function set(instance, key, value) {
  return new instance.constructor((
    typeof key === 'object' ? key : { [key]: value }
  ), instance);
}

export default symbol;
