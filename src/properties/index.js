import { createAssertion } from '../assert';
import { map } from '../utils';

import * as checked from './checked';
import * as disabled from './disabled';
import * as exists from './exists';
import * as focusable from './focusable';
import * as focused from './focused';
import * as scrollable from './scrollable';
import * as scrollableX from './scrollable-x';
import * as scrollableY from './scrollable-y';
import * as selected from './selected';
import * as text from './text';

const assertions = {};
const properties = {
  checked,
  disabled,
  exists,
  focusable,
  focused,
  scrollable,
  scrollableX,
  scrollableY,
  selected,
  text
};

// populated during default export creation
export { assertions };

// export property descriptors and collect/create respective assertions
export default map(properties, ({ computed, method, assert }, key) => {
  assertions[key] = assert || createAssertion(key, computed || method);
  // return a getter for computed properties or a method otherwise
  return computed ? { get: computed } : { value: method };
});
