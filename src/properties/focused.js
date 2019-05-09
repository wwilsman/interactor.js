import computed from '../helpers/computed';

export default function focused(selector) {
  return computed(
    selector,
    function(element) {
      let { document } = this.$dom;
      return element === document.activeElement;
    },
    actual => ({
      result: actual,
      message: () => (
        `${actual ? '' : 'not '}focused`
      )
    })
  );
}
