import Assertion from '../assertion.js';

export class FocusedAssertion extends Assertion {
  constructor() {
    super(({ $ }) => $ === globalThis.document?.activeElement,
      '#{this} is not focused',
      '#{this} is focused'
    );
  }
}

export default FocusedAssertion;
