import Assertion from '../assertion.js';

export class AttributeAssertion extends Assertion {
  /**
   * @param {string} name
   * @param {string} expected
   */
  constructor(name, expected) {
    super(({ $ }) => $.getAttribute(name) === expected,
      ({ $ }) => `#{this} \`${name}\` attribute is "${$.getAttribute(name)}" but expected "${expected}"`,
      `#{this} \`${name}\` attribute is "${expected}" but expected it not to be`
    );
  }
}

export default AttributeAssertion;
