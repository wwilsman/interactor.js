export function scrollableX() {
  let result = this.scrollableX;

  return {
    result,
    message: () => (
      `${result ? 'has' : 'no'} overflow-x`
    )
  };
};

export function scrollableY() {
  let result = this.scrollableY;

  return {
    result,
    message: () => (
      `${result ? 'has' : 'no'} overflow-y`
    )
  };
};

export default function scrollable() {
  let result = this.scrollable;

  return {
    result,
    message: () => (
      `${result ? 'has' : 'no'} overflow`
    )
  };
};
