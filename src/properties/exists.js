import { assertion } from '../assert';

export function get() {
  try {
    return !!this.$();
  } catch (e) {
    return false;
  }
}

export const assert = assertion(get, result => ({
  message: '%{@} %{- does not exist|exists}',
  result
}));
