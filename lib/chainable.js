export const Chain = Symbol('@@interactor|chain');

export function flattenChain(chain) {
  return [chain].reduce(function reduce(chain, next) {
    if (next?.[Chain]) chain.unshift(next?.[Chain]);
    return !next ? chain : reduce(chain, Object.getPrototypeOf(next));
  }, []);
}

/**
 * @template T, TChain, TReturn
 * @typedef {(T & {
 *   then: TChain & PromiseLike<
 *     TReturn extends import('./context').ContextGenerator<any, infer R> ? R : TReturn
 *   >["then"]
 * })} Chainable
 */

export function chainable(value, instance, handler) {
  let next = Object.setPrototypeOf({},
    typeof instance === 'function'
      ? Object.getPrototypeOf(instance)
      : instance);

  Object.defineProperty(next, Chain, {
    value, enumerable: false
  });

  return Object.setPrototypeOf({
    then: Object.setPrototypeOf(function then(onFulfilled, onRejected) {
      let signal = onFulfilled?.signal;
      if (signal) onFulfilled = v => v;

      while (instance[Chain])
        instance = Object.getPrototypeOf(instance);

      return handler(instance, flattenChain(next), signal)
        .then(onFulfilled, onRejected);
    }, next)
  }, value);
}

export default chainable;
