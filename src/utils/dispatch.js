const { assign } = Object;

export default function dispatch(element, name, options = {}) {
  let {
    bubbles = true,
    cancelable = true,
    ...opts
  } = options;

  let event = new Event(name, { bubbles, cancelable });
  assign(event, opts);

  return element.dispatchEvent(event);
}
