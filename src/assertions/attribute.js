import method from '../helpers/attribute';

export default {
  validate(attr, value) {
    return method.call(this, attr) === value;
  },
  message(result, attr, value) {
    return result
      ? `expected "${attr}" to not be "${value}"`
      : `expected "${attr}" to be "${value}" but recieved ${method.call(this, attr)}`;
  }
};
