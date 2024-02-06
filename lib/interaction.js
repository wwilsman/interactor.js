import Context from './context.js';

export class Interaction {
  static Symbol = Symbol('@@interactor|interaction');

  /**
   * @param {import('./context').ContextYield} [interaction]
   */
  constructor(interaction) {
    Object.defineProperty(this, Interaction.Symbol, {
      *value() { return interaction; },
      enumerable: false
    });

    Object.defineProperty(this, Context.Symbol, {
      enumerable: false,
      value: {}
    });
  }
}

export default Interaction;
