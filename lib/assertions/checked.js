import Assertion from '../assertion.js';

export class CheckedAssertion extends Assertion {
  constructor() {
    super(({ $ }) => !!$.checked,
      '#{this} is not checked',
      '#{this} is checked'
    );
  }
}

export default CheckedAssertion;
