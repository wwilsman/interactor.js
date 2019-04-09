import computed from '../helpers/computed';

export default function focused(selector) {
  return computed(selector, function(element) {
    return element === this.$dom.document.activeElement;
  });
}
