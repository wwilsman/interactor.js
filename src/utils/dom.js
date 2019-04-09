function isElement(obj) {
  // safe way to check `instanceof Element` when Element can be in a virtual DOM
  return obj && 'ownerDocument' in obj && 'defaultView' in obj.ownerDocument &&
    obj instanceof obj.ownerDocument.defaultView.Element;
}

export function $(selector, $ctx) {
  let $node = null;

  /* istanbul ignore if: sanity check */
  if (!$ctx || typeof $ctx.querySelector !== 'function') {
    throw new Error('unable to use the current context');
  }

  /* istanbul ignore else: unnecessary */
  if (typeof selector === 'string') {
    try {
      $node = $ctx.querySelector(selector);
    } catch (e) {
      throw new SyntaxError(`"${selector}" is not a valid selector`);
    }

  // if an element was given, return it
  } else if (isElement(selector)) {
    return selector;

  // if the selector is falsy, return the context element
  } else if (!selector) {
    return $ctx;
  }

  if (!$node) {
    throw new Error(`unable to find "${selector}"`);
  }

  return $node;
}

export function $$(selector, $ctx) {
  let nodes = [];

  /* istanbul ignore if: sanity check */
  if (!$ctx || typeof $ctx.querySelectorAll !== 'function') {
    throw new Error('unable to use the current context');
  }

  /* istanbul ignore else: unnecessary */
  if (typeof selector === 'string') {
    try {
      nodes = [].slice.call($ctx.querySelectorAll(selector));
    } catch (e) {
      throw new SyntaxError(`"${selector}" is not a valid selector`);
    }

  // given an iterable, assume it contains nodes
  } else if (Symbol.iterator in Object(selector)) {
    nodes = [].slice.call(selector);
  }

  // only return elements
  /* istanbul ignore next: sanity check */
  return nodes.filter(isElement);
}
