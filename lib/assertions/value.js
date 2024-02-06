import Assertion from '../assertion.js';

export class ValueAssertion extends Assertion {
  /**
   * @param {any} expected
   */
  constructor(expected) {
    // @ts-ignore
    super(({ $ }) => $.value === expected,
      // @ts-ignore
      ({ $ }) => `#{this} value is "${$.value}" but expected "${expected}"`,
      `#{this} value is "${expected}" but expected it not to be`
    );
  }
}

export default ValueAssertion;
