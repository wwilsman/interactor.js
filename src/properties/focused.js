import computed from '../helpers/computed';

export default function focused(selector) {
  return computed(selector, element => (
    element === document.activeElement
  ));
}
