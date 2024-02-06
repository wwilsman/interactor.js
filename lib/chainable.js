export const Chain = Symbol('@@interactor|chain');

export function flattenChain(chain) {
  return [chain].reduce(function reduce(chain, next) {
    if (next?.[Chain]) chain.unshift(next?.[Chain]);
    return !next ? chain : reduce(chain, Object.getPrototypeOf(next));
  }, []);
}

/**
 * @template T, TChain
 * @typedef {(T & {
 *   then: TChain & (<TResult1, TResult2>(
 *     onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
 *     onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
 *   ) => Promise<TResult1 | TResult2>)
 * })} Chainable
 */

/**
 * @template {{}} T
 * @template {{}} TChain
 * @param {T} value
 * @param {TChain} instance
 * @param {(instance: TChain, values: any[], signal?: AbortSignal) => Promise<any>} handler
 * @returns {Chainable<T, TChain>}
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
