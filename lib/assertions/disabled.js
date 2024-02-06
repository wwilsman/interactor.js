import Assertion from '../assertion.js';

export class DisabledAssertion extends Assertion {
  constructor() {
    // @ts-ignore
    super(({ $ }) => !!$.disabled,
      '#{this} is not disabled',
      '#{this} is disabled'
    );
  }
}

export default DisabledAssertion;
