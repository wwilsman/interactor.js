import { isConvergence } from '@bigtest/convergence';

/**
 * Gets the first element matching a selector via `querySelector`.
 *
 * @private
 * @param {String} selector - Query selector string
 * @param {Element} [$ctx=document] - optional context that supports
 * the `querySelector` method
 * @returns {Element} Matching element
 */
export function $(selector, $ctx = document) {
  let $node = selector;

  if (!$ctx || typeof $ctx.querySelector !== 'function') {
    throw new Error('unable to use the current context');
  }

  if (typeof selector === 'string') {
    $node = $ctx.querySelector(selector);

  // if a non-string is falsy, return the context element
  } else if (!selector) {
    return $ctx;
  }

  if (!$node) {
    throw new Error(`unable to find "${selector}"`);
  }

  return $node;
}

/**
 * Gets all elements matching a selector via `querySelectorAll()`.
 *
 * @private
 * @param {String} selector - Query selector string
 * @param {Element} [$ctx=document] - optional context that supports
 * the `querySelectorAll` method
 * @returns {Array} Array of elements
 */
export function $$(selector, $ctx = document) {
  let nodes = [];

  if (!$ctx || typeof $ctx.querySelectorAll !== 'function') {
    throw new Error('unable to use the current context');
  }

  if (typeof selector === 'string') {
    nodes = [].slice.call($ctx.querySelectorAll(selector));
  }

  return nodes;
}

/**
 * Returns `true` if the object has common interactor properties
 *
 * ``` javascript
 * let result = maybeInteractor()
 *
 * if (isInteractor(result)) {
 *   await result.login(user)
 * } else {
 *   something(result)
 * }
 * ```
 *
 * @static
 * @alias Interactor.isInteractor
 * @param {Object} obj - A possible interactor object
 * @returns {Boolean}
 */
export function isInteractor(obj) {
  return isConvergence(obj) &&
    '$' in obj && typeof obj.$ === 'function' &&
    '$$' in obj && typeof obj.$$ === 'function' &&
    '$root' in obj;
}

/**
 * Returns `true` if the provided object looks like a property
 * descriptor and have both `enumerable` and `configurable` properties
 * in addition to a `value` or `get` property.
 *
 * @private
 * @param {Object} descr - Maybe a property descriptor
 * @returns {Boolean}
 */
export function isPropertyDescriptor(descr) {
  return descr &&
    (Object.hasOwnProperty.call(descr, 'get') ||
     Object.hasOwnProperty.call(descr, 'value')) &&
    Object.hasOwnProperty.call(descr, 'enumerable') &&
    Object.hasOwnProperty.call(descr, 'configurable');
}

/**
 * Returns an array of all method names found on an object including
 * any inherited methods (not including Object.prototype).
 *
 * @private
 * @param {Object} instance - Instance to find methods for
 * @returns {String[]} Array of method names
 */
export function getMethodNames(instance) {
  let proto = Object.getPrototypeOf(instance);
  let descr = {};

  while (proto && proto !== Object.prototype) {
    // uses descriptors to avoid invoking getters when filtering
    descr = Object.assign({}, Object.getOwnPropertyDescriptors(proto), descr);
    proto = Object.getPrototypeOf(proto);
  }

  return Object.keys(descr).filter(name => {
    return name !== 'constructor' &&
      typeof descr[name].value === 'function';
  });
}
