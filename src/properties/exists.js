import computed from '../helpers/computed';

export default function exists(selector) {
  return computed(
    function() {
      try {
        return !!this.$(selector);
      } catch (e) {
        return false;
      }
    },
    actual => ({
      result: actual,
      message: () => (
        actual ? '%s exists' : '%s does not exist'
      )
    })
  );
}
