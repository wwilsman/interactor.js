import Assertion from '../assertion.js';
import Selector from '../selector.js';

export class WithinAssertion extends Assertion {
  /**
   * @param {string} selector
   */
  constructor(selector) {
    super(({ $ }) => $.closest(Selector.parse(selector)?.sel || selector),
      `#{this} is not within '${selector}'`,
      `#{this} is within '${selector}'`
    );
  }
}

export default WithinAssertion;
