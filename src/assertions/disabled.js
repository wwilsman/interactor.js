import error from '../error';

// Asserts that the interactor element is disabled or not.
export default function disabled(expected) {
  if (this.$().disabled !== expected) {
    throw error('%{@} is %{- not} disabled');
  }
}
