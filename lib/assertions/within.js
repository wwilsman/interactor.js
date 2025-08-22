import Assertion from '../assertion.js';

export class WithinAssertion extends Assertion {
  /**
   * @param {string} selector
   */
  constructor(selector) {
    super(({ $ }) => $.closest(selector),
      `#{this} is not within '${selector}'`,
      `#{this} is within '${selector}'`
    );
  }
}

export default WithinAssertion;
