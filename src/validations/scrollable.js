export function scrollableX() {
  return {
    validate() {
      return this.scrollableX;
    },
    message(result) {
      return `${result ? 'has' : 'no'} overflow-x`;
    }
  };
}

export function scrollableY() {
  return {
    validate() {
      return this.scrollableY;
    },
    message(result) {
      return `${result ? 'has' : 'no'} overflow-y`;
    }
  };
}

export default function scrollable() {
  return {
    validate() {
      return this.scrollable;
    },
    message(result) {
      return `${result ? 'has' : 'no'} overflow`;
    }
  };
}
