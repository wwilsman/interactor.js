import Assertion from '../assertion.js';

export class OverflowsAssertion extends Assertion {
  /**
   * @param {("x" | "y")} [axis]
   */
  constructor(axis) {
    if (axis != null && axis !== 'x' && axis !== 'y')
      throw new Error(`Invalid overflow axis: ${axis}`);

    let overflowsX = ({ $ }) =>
      $.scrollWidth > $.clientWidth;
    let overflowsY = ({ $ }) =>
      $.scrollHeight > $.clientHeight;

    let assertion = function* overflows() {
      if (axis === 'x') return yield overflowsX;
      if (axis === 'y') return yield overflowsY;
      return (yield overflowsY) || (yield overflowsX);
    };

    super(assertion,
      `#{this} has no overflow${axis ? `-${axis}` : ''}`,
      `#{this} has overflow${axis ? `-${axis}` : ''}`
    );
  }
}

export default OverflowsAssertion;
