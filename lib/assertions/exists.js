import Assertion from '../assertion.js';

export class ExistsAssertion extends Assertion {
  constructor() {
    super(({ $ }) => !!$,
      'Could not find #{this}',
      'Found #{this} but expected not to'
    );
  }
}

export default ExistsAssertion;
