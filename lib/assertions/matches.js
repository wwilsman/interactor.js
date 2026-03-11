import Assertion from '../assertion.js';
import Selector from '../selector.js';

export class MatchesAssertion extends Assertion {
  /**
   * @param {string} selector
   */
  constructor(selector) {
    super(({ $ }) => $.matches(Selector.parse(selector)?.sel || selector),
      `#{this} does not match '${selector}'`,
      `#{this} matches '${selector}'`
    );
  }
}

export default MatchesAssertion;
