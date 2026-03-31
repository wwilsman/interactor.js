import Assertion from '../assertion.js';
import Selector from '../selector.js';

export class WithinAssertion extends Assertion {
  /**
   * @param {string} selector
   */
  constructor(selector) {
    let sel = Selector.parse(selector)?.sel || selector;

    super(({ $ }) => $.closest(sel),
      `#{this} is not within '${selector}'`,
      `#{this} is within '${selector}'`
    );
  }
}

export default WithinAssertion;
