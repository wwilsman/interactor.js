import { hasLayoutEngine } from '../dom.js';

function isHiddenByStyles(element) {
  let style = getComputedStyle(element);

  return style.display === 'none' ||
    style.visibility !== 'visible' ||
    style.opacity < 0.1;
}

function isInsideViewport(element) {
  let { top, left, bottom, right, width, height } = element.getBoundingClientRect();
  if (width === 0 || height === 0 || bottom < 0 || right < 0) return false;

  let { innerHeight, innerWidth } = element.ownerDocument.defaultView;
  return top < innerHeight && left < innerWidth;
}

function isElementAtPoint(element, x, y) {
  let pointer = element.ownerDocument.elementFromPoint(x, y);
  if (pointer === element) return true;

  while ((pointer = pointer?.parentNode))
    if (pointer === element) return true;

  return false;
}

function isElementOnTop(element) {
  let { top, left, bottom, right, width, height } = element.getBoundingClientRect();
  let [cx, cy] = [left + (width / 2), top + (height / 2)];

  return isElementAtPoint(element, cx, cy) ||
    isElementAtPoint(element, cx, top + 1) ||
    isElementAtPoint(element, cx, bottom - 1) ||
    isElementAtPoint(element, left + 1, cy) ||
    isElementAtPoint(element, right - 1, cy);
}

export function get() {
  let element = this.$();
  hasLayoutEngine(this, 'Visibility');
  if (isHiddenByStyles(element)) return false;
  if (!isInsideViewport(element)) return false;
  if (!isElementOnTop(element)) return false;
  return true;
}
