import Assertion from '../assertion.js';
import Selector from '../selector.js';

export class ContainsAssertion extends Assertion {
  /**
   * @param {import('../selector.js').SelectorInput} selector
   */
  constructor(selector) {
    super(context => {
      let sel = new Selector({
        root: context.selector,
        selector
      });

      return {
        assertion: () => sel.query({ strict: false }),
        failureMessage: `#{this} does not contain ${sel}`,
        negatedMessage: `#{this} contains ${sel}`
      };
    });
  }
}

export default ContainsAssertion;
