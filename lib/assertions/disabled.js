import Assertion from '../assertion.js';

export class DisabledAssertion extends Assertion {
  constructor() {
    super(({ $ }) => !!$.disabled,
      '#{this} is not disabled',
      '#{this} is disabled'
    );
  }
}

export default DisabledAssertion;
