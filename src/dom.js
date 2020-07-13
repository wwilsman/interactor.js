import m from './meta';
import error from './error';
import { assign } from './utils';

// Return an interactor instance's associated DOM object
export function dom(inst) {
  return inst.constructor.dom;
}

// Returns an element that can be used to query for child elements
function getParentElement(inst, deep) {
  let { parent, selector } = m.get(inst);

  let $parent = parent
    ? parent.$()
    : dom(inst).document.body;

  // when no selector is provided the current element is returned
  let ret = typeof selector === 'function' ? selector($parent) : (
    selector ? $parent.querySelector(selector) : $parent
  );

  if (!ret) {
    throw error('could not find %{@}').bind(inst);
  }

  // look inside content documents
  if (deep && ('contentDocument' in ret)) {
    if (!ret.contentDocument) {
      throw error('%{@} is inaccessible, possibly due to CORS').bind(inst);
    } else {
      ret = ret.contentDocument.body;
    }
  }

  return ret;
}

// Query the DOM and return one or more elements. Multiple elements are only returned when the
// second argument is true. The first argument may be a string selector, interactor selector, or
// selector function. Selector functions should return a single DOM element or an array of DOM
// elements when the second argument is true. When no selector is provided, it returns the current
// interactor instance's own element.
export function query(sel, multiple) {
  if (multiple && !sel) {
    throw error(
      'cannot query for multiple elements without a selector'
    );
  }

  // was the provided selector an interactor selector?
  let sq = m.get(sel, 'queue');

  if (sq?.length) {
    throw error(
      'the provided interactor must not have queued actions'
    );
  }

  // get the containing parent element
  let ret = getParentElement(this, !!sel);

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

// Dispatch an arbitrary event on an element with bubbles and cancelable options defaulting to true.
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
