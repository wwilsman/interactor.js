import computed from '../helpers/computed';

export default function checked(selector) {
  return computed(
    selector,
    element => element.checked,
    actual => ({
      result: actual,
      message: () => (
        `%s ${actual ? 'is' : 'is not'} checked`
      )
    })
  );
}
