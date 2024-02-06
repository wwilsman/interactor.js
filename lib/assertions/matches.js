import Assertion from '../assertion.js';

export class MatchesAssertion extends Assertion {
  constructor(selector) {
    super(({ $ }) => $.matches(selector),
      `#{this} does not match \`${selector}\``,
      `#{this} matches \`${selector}\``
    );
  }
}

export default MatchesAssertion;
