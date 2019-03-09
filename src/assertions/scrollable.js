export const scrollableX = {
  validate() {
    return this.scrollableX;
  },
  message(result) {
    return `${result ? 'has' : 'no'} overflow-x`;
  }
};

export const scrollableY = {
  validate() {
    return this.scrollableY;
  },
  message(result) {
    return `${result ? 'has' : 'no'} overflow-y`;
  }
};

export default {
  validate() {
    return this.scrollable;
  },
  message(result) {
    return `${result ? 'has' : 'no'} overflow`;
  }
};
