import { createAssertion } from '../assert';
import { map } from '../utils';

import * as checked from './checked';
import * as disabled from './disabled';
import * as focusable from './focusable';
import * as focused from './focused';

const assertions = {};
const properties = {
  checked,
  disabled,
  focusable,
  focused
};

// populated during default export creation
export { assertions };

// export property descriptors and collect/create respective assertions
export default map(properties, ({ computed, method, assert }, key) => {
  assertions[key] = assert || createAssertion(key, computed || method);
  // return a getter for computed properties or a method otherwise
  return computed ? { get: computed } : { value: method };
});
