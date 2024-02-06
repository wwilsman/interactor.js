import Assertion from '../assertion.js';

export class TextAssertion extends Assertion {
  /**
   * @param {string} expected
   */
  constructor(expected) {
    super(({ $ }) => $.innerText === expected,
      ({ $ }) => `#{this} text is "${$.innerText}" but expected "${expected}"`,
      `#{this} text is "${expected}" but expected it not to be`
    );
  }
}

export default TextAssertion;
