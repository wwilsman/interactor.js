import Assertion from '../assertion.js';

function isHiddenByStyles({ $ }) {
  let { getComputedStyle } = $.ownerDocument.defaultView;
  let style = getComputedStyle($);

  return style.display === 'none' ||
    style.visibility !== 'visible' ||
    style.opacity < 0.1;
}

function isInsideViewport({ $ }) {
  let { top, left, bottom, right, width, height } = $.getBoundingClientRect();
  if (width === 0 || height === 0 || bottom < 0 || right < 0) return false;
  let { innerHeight, innerWidth } = $.ownerDocument.defaultView;
  return top < innerHeight && left < innerWidth;
}

function isElementAtPoint($, x, y) {
  let pointer = $.ownerDocument.elementFromPoint(x, y);
  if (pointer === $) return true;

  while ((pointer = pointer?.parentNode))
    if (pointer === $) return true;

  return false;
}

function isElementOnTop({ $ }) {
  let { top, left, bottom, right, width, height } = $.getBoundingClientRect();
  let [cx, cy] = [left + (width / 2), top + (height / 2)];

  return isElementAtPoint($, cx, cy) ||
    isElementAtPoint($, cx, top + 1) ||
    isElementAtPoint($, cx, bottom - 1) ||
    isElementAtPoint($, left + 1, cy) ||
    isElementAtPoint($, right - 1, cy);
}

export class VisibleAssertion extends Assertion {
  constructor() {
    let assertion = function* visible() {
      if (yield isHiddenByStyles) return false;
      if (!(yield isInsideViewport)) return false;
      if (!(yield isElementOnTop)) return false;
      return true;
    };

    super(assertion,
      '#{this} is not visible',
      '#{this} is visible'
    );
  }
}

export default VisibleAssertion;
