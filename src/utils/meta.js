const symbol = Symbol('meta');

export function get(interactor, key) {
  let meta = interactor && interactor[symbol];
  return (meta && key) ? meta[key] : meta;
}

export function set(interactor, options) {
  return new interactor.constructor(options, interactor);
}

export default symbol;
