export function scrollableX(selector) {
  let result = selector
    ? this.scoped(selector).scrollableX
    : this.scrollableX;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" ` : '') + (
        `has ${result ? '' : 'no '}overflow-x`
      )
    )
  };
};

export function scrollableY(selector) {
  let result = selector
    ? this.scoped(selector).scrollableY
    : this.scrollableY;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" ` : '') + (
        `has ${result ? '' : 'no '}overflow-y`
      )
    )
  };
};

export default function scrollable(selector) {
  let result = selector
    ? this.scoped(selector).scrollable
    : this.scrollable;

  return {
    result,
    message: () => (
      (selector ? `"${selector}" ` : '') + (
        `has ${result ? '' : 'no '}overflow`
      )
    )
  };
};
