export class Arrangement {
  static Symbol = Symbol('@@interactor|arrangement');

  /** @param {import('./context').ContextYield} [arrangement] */
  constructor(arrangement) {
    Object.defineProperty(this, Arrangement.Symbol, {
      *value() { return arrangement; },
      enumerable: false
    });
  }
}

export default Arrangement;
