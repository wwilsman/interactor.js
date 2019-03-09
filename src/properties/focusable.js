import computed from '../helpers/computed';

export default function focusable(selector) {
  return computed(selector, element => element.tabIndex > -1);
}
