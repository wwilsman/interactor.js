import m from './meta';
import error from './error';
import { assign } from './utils';

export function dispatch($el, name, {
  bubbles = true,
  cancelable = true,
  ...options
}) {
  return $el.dispatchEvent(assign(
    new Event(name, { bubbles, cancelable }),
    options
  ));
}

// Query the DOM and return one or more elements. Multiple elements are only returned when the
// second argument is true. The first argument may be a string selector, interactor selector, or
// selector function. Selector functions should return a single DOM element or an array of DOM
// elements when the second argument is true. When no selector is provided, it returns the current
// interactor instance's own element.
export default function query(sel, multiple) {
  if (multiple && !sel) {
    throw error(
      'cannot query for multiple elements without a selector'
    );
  }

  let { parent, selector } = m.get(this);
  let $parent = parent ? parent.$() : document.body;

  // was the provided selector an interactor selector?
  let sq = m.get(sel, 'queue');

  // when no selector is provided the current element is returned
  let ret = typeof selector === 'function' ? selector($parent) : (
    selector ? $parent.querySelector(selector) : $parent
  );

  if (!ret) {
    throw error('could not find %{@}').bind(this);
  }

  if (sq?.length) {
    throw error(
      'the provided interactor must not have queued actions'
    );
  }

  // get the real selector from the interactor
  sel = sq ? m.get(sel, 'selector') : sel;

  if (typeof sel === 'function') {
    ret = sel(ret, multiple);
  } else if (typeof sel === 'string') {
    ret = multiple
      ? ret.querySelectorAll(sel)
      : ret.querySelector(sel);
  } else if (sel) {
    throw error(`unknown selector: ${sel}`);
  }

  ret = multiple ? Array.from(ret) : ret;

  if (!multiple && !ret) {
    throw error(`could not find %{@ ${sel}}`).bind(this);
  }

  return ret;
}
