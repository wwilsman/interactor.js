import computed from '../helpers/computed';

export default function value(selector) {
  return computed(selector, element => element.value);
}
