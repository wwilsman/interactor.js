import Assertion from '../assertion.js';

export class ScrollableAssertion extends Assertion {
  /**
   * @param {("x" | "y")} [axis]
   */
  constructor(axis) {
    if (axis != null && axis !== 'x' && axis !== 'y')
      throw new Error(`Invalid scroll axis: ${axis}`);

    let scrollableX = ({ $ }) => {
      let { overflowX } = $.ownerDocument.defaultView.getComputedStyle($);
      return overflowX === 'scroll' || overflowX === 'auto';
    };

    let scrollableY = ({ $ }) => {
      let { overflowY } = $.ownerDocument.defaultView.getComputedStyle($);
      return overflowY === 'scroll' || overflowY === 'auto';
    };

    let assertion = function* scrollable() {
      yield this.assert.overflows(axis);
      if (axis === 'x') return yield scrollableX;
      if (axis === 'y') return yield scrollableY;
      return (yield scrollableY) || (yield scrollableX);
    };

    let dir = axis === 'x'
      ? 'horizontally'
      : 'vertically';

    super(assertion,
      `#{this} is not scrollable${axis ? ` ${dir}` : ''}`,
      `#{this} is scrollable${axis ? ` ${dir}` : ''}`
    );
  }
}

export default ScrollableAssertion;
