import Assertion from '../assertion.js';
import Selector from '../selector.js';

export class MatchesAssertion extends Assertion {
  /**
   * @param {string} selector
   */
  constructor(selector) {
    let sel = Selector.parse(selector)?.sel || selector;

    super(({ $ }) => $.matches(sel),
      `#{this} does not match '${selector}'`,
      `#{this} matches '${selector}'`
    );
  }
}

export default MatchesAssertion;
