import scoped from '../helpers/scoped';
import dispatch from '../utils/dispatch';

export default function trigger(selector, event, options) {
  if (typeof event === 'object' || !event) {
    options = event;
    event = selector;
    selector = null;
  }

  return scoped(selector)
    .do(element => {
      dispatch(element, event, options);
    });
}
