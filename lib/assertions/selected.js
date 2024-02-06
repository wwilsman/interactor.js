import Assertion from '../assertion.js';

export class SelectedAssertion extends Assertion {
  constructor() {
    // @ts-ignore
    super(({ $ }) => !!$.selected,
      '#{this} is not selected',
      '#{this} is selected'
    );
  }
}

export default SelectedAssertion;
