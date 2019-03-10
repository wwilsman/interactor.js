import computed from '../helpers/computed';

export default function text(selector) {
  return computed(selector, element => element.innerText);
}
