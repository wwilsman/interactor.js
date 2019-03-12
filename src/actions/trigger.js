import scoped from '../helpers/scoped';

const { assign } = Object;

export function dispatch(element, name, options = {}) {
  let {
    bubbles = true,
    cancelable = true,
    ...opts
  } = options;

  let event = new Event(name, { bubbles, cancelable });
  assign(event, opts);

  return element.dispatchEvent(event);
}

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
