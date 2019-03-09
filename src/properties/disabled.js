import computed from '../helpers/computed';

export default function disabled(selector) {
  return computed(selector, element => !!element.disabled);
}
