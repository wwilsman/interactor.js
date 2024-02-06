import Assertion from '../assertion.js';

export class ValueAssertion extends Assertion {
  constructor(expected) {
    super(({ $ }) => $.value === expected,
      ({ $ }) => `#{this} value is "${$.value}" but expected "${expected}"`,
      `#{this} value is "${expected}" but expected it not to be`
    );
  }
}

export default ValueAssertion;
