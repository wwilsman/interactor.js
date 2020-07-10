import { createAssertion } from '../assert';
import { map } from '../utils';

import * as attribute from './attribute';
import * as checked from './checked';
import * as disabled from './disabled';
import * as exists from './exists';
import * as focusable from './focusable';
import * as focused from './focused';
import * as property from './property';
import * as scrollable from './scrollable';
import * as scrollableX from './scrollable-x';
import * as scrollableY from './scrollable-y';
import * as selected from './selected';
import * as text from './text';
import * as value from './value';

const assertions = {};
const properties = {
  attribute,
  checked,
  disabled,
  exists,
  focusable,
  focused,
  property,
  scrollable,
  scrollableX,
  scrollableY,
  selected,
  text,
  value
};

// populated during default export creation
export { assertions };

// export property descriptors and collect/create respective assertions
export default map(properties, ({ computed, method, assert }, key) => {
  /* istanbul ignore next: futureproof for property methods with an auto generated assertion */
  assertions[key] = assert || createAssertion(key, computed || method);
  // return a getter for computed properties or a method otherwise
  return computed ? { get: computed } : { value: method };
});
