import { get, set } from './meta';

const {
  assign,
  defineProperties,
  entries,
  getPrototypeOf,
  getOwnPropertyDescriptors
} = Object;

/**
 * Returns true when two instances share the same prototype.
 *
 * @private
 * @param {*} a - Instance A
 * @param {*} b - Instance B
 * @returns {Boolean}
 */
function isSameType(a, b) {
  return a && b && getPrototypeOf(a) === getPrototypeOf(b);
}

/**
 * Wraps a method or getter to return an appended parent instance when
 * another same-type instance is returned. The original function is
 * called with the context of an orphaned instance so that it does not
 * return parent instances inside of methods or getters. If a returned
 * instance has a parent with the same type, the original instance is
 * restored as the proper parent.
 *
 * @private
 * @param {Function} fn - Method or getter to wrap
 * @returns {Function}
 */
function chainable(fn) {
  return function(...args) {
    // use an instance with no chaining to prevent upwards reflection
    let results = fn.apply(this.only(), args);

    // chain new children and correct parent chaining
    if (isSameType(this, get(results, 'parent'))) {
      results = set(results, { parent: this, chain: true });
    }

    // when the instance is the same type as it's parent it always
    // enters the above branch, which is safe, but we still need it to
    // enter the branch below; so no `else` branch is necessary

    // roll up the parent chain with append
    if (isSameType(this, results)) {
      results = get(this, 'parent').append(results);
    }

    return results;
  };
}

/**
 * Returns an object containing all property descriptors for an
 * instance's own and inherited properties.
 *
 * @private
 * @param {Object} instance
 * @returns {Object}
 */
function getAllDescriptors(instance) {
  let proto = instance;
  let descr = {};

  while (proto && proto !== Object.prototype) {
    // prioritize property descriptors closest to the instance prototype
    descr = assign({}, getOwnPropertyDescriptors(proto), descr);
    proto = getPrototypeOf(proto);
  }

  return descr;
}

/**
 * Redefines all properties of an interactor instance to return
 * parent-chainable methods and accessors. The methods and accessors
 * are bound to an orphaned instance when inovked and when returning
 * an interactor of the same type as itself, it is appended up the
 * parent chain. When a method or property returns an interactor whose
 * parent is an instance of the current interactor, the parnet-chain
 * is ammened to relfect the proper hierarchy for appending later.
 *
 * @private
 * @param {Interactor} instance
 */
export default function makeChainable(instance) {
  defineProperties(
    instance,
    entries(getAllDescriptors(instance))
    // make all descriptors parent chainable
      .reduce((acc, [key, descriptor]) => {
        let { value, get } = descriptor;

        // do not include the constructor, element getter, or other
        // non-configurable descriptors
        if (key === 'constructor' || key === '$element' ||
            descriptor.configurable === false) {
          return acc;
        }

        // make methods and getters chainable
        /* istanbul ignore else: unnecessary */
        if (typeof value === 'function') {
          assign(descriptor, {
            value: chainable(value)
          });
        } else if (typeof get === 'function') {
          assign(descriptor, {
            get: chainable(get)
          });
        }

        return assign(acc, {
          [key]: descriptor
        });
      }, {
        // provide method for breaking the chain
        only: {
          value: () => {
            return set(instance, {
              chain: false
            });
          }
        }
      })
  );
}