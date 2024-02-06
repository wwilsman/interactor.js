import Assertion from '../assertion.js';

export class MatchesAssertion extends Assertion {
  /**
   * @param {string} selector
   */
  constructor(selector) {
    super(({ $ }) => $.matches(selector),
      `#{this} does not match \`${selector}\``,
      `#{this} matches \`${selector}\``
    );
  }
}

export default MatchesAssertion;
