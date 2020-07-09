import { assertion } from '../assert';

// .exists
export function computed() {
  try {
    return !!this.$();
  } catch (e) {
    return false;
  }
}

// use a matcher
export const assert = assertion(computed, result => ({
  message: '%{@} %{- does not exist|exists}',
  result
}));
