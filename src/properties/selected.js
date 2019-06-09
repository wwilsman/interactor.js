import computed from '../helpers/computed';

export default function selected(selector) {
  return computed(
    selector,
    element => element.selected,
    actual => ({
      result: actual,
      message: () => (
        `%s ${actual ? 'is' : 'is not'} selected`
      )
    })
  );
}
