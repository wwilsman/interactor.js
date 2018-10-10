/* global Element */
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
  let $node = null;

  if (!$ctx || typeof $ctx.querySelector !== 'function') {
    throw new Error('unable to use the current context');
  }

  if (typeof selector === 'string') {
    try {
      $node = $ctx.querySelector(selector);
    } catch (e) {
      throw new SyntaxError(`"${selector}" is not a valid selector`);
    }

  // if an element was given, return it
  } else if (selector instanceof Element) {
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

  // given a string, use `querySelectorAll`
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
  return nodes.filter($node => $node instanceof Element);
}

/**
 * Returns `true` if the object has common interactor properties
 *
 * ``` javascript
 * let result = maybeInteractor();
 *
 * if (isInteractor(result)) {
 *   await result.login(user);
 * } else {
 *   something(result);
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
 * Returns a descriptor found on an object including inherited
 * descriptors (not including Object descriptors).
 *
 * @private
 * @param {Object} instance - Instance to find a descriptor for
 * @param {String} key - Property key
 * @returns {Object} found descriptor, or null
 */
export function getDescriptor(instance, key) {
  let proto = instance;
  let descr = null;

  while (proto && proto !== Object.prototype) {
    descr = Object.getOwnPropertyDescriptor(proto, key);
    proto = Object.getPrototypeOf(proto);
    if (descr) break;
  }

  return descr;
}

/**
 * Returns all descriptors found on an object's prototype chain not
 * including own properties, the constructor, or Object descriptors.
 *
 * @private
 * @param {Object} instance - Instance to find descriptors for
 * @returns {Object} own and inherited descriptors
 */
export function getDescriptors(instance) {
  let proto = Object.getPrototypeOf(instance);
  let descr = {};

  while (proto && proto !== Object.prototype) {
    // prioritize property descriptors closest to the instance prototype
    descr = Object.assign({}, Object.getOwnPropertyDescriptors(proto), descr);
    proto = Object.getPrototypeOf(proto);
  }

  // do not return the constructor
  delete descr.constructor;
  return descr;
}

/**
 * Returns an instance of the topmost parent interactor by appending
 * the interactor up the chain of its parents.
 *
 * @private
 * @param {Interactor} interactor - Potentially nested interactor
 * @returns {Interactor} topmost interactor instance
 */
export function appendUp(interactor) {
  while (interactor.__parent__) {
    interactor = interactor.__parent__.append(interactor);
  }

  return interactor;
}
