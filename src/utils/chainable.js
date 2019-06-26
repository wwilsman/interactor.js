import isInteractor from './is-interactor';
import { get, set } from './meta';

const {
  assign,
  defineProperties,
  entries,
  getPrototypeOf,
  getOwnPropertyDescriptors
} = Object;

function isSameType(a, b) {
  return a && b && getPrototypeOf(a) === getPrototypeOf(b);
}

function chainable(fn) {
  return function(...args) {
    // assertions hold the interactor in meta
    let isInstance = isInteractor(this);
    let interactor = isInstance ? this : get(this);

    // use an instance with no chaining to prevent upwards reflection
    let results = fn.apply(isInstance ? this.only() : this, args);

    if (isInteractor(results)) {
      let parent = get(results, 'parent');

      // chain new children and correct parent chaining
      if (isSameType(interactor, parent) && get(interactor, 'parent') !== parent) {
        results = set(results, { parent: interactor, chain: true });
      }

      // roll up the parent chain with append
      if (isSameType(interactor, results)) {
        results = get(interactor, 'parent').append(results);
      }
    }

    return results;
  };
}

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

export function chainAssert(assert) {
  return defineProperties(assert, entries(
    getOwnPropertyDescriptors(assert)
  ).reduce((acc, [key, descriptor]) => {
    let { value } = descriptor;

    if (typeof value === 'function' && key !== 'scoped') {
      return assign(acc, {
        [key]: assign(descriptor, {
          value: chainable(value)
        })
      });
    } else {
      return acc;
    }
  }, {}));
}

export default function makeChainable(instance) {
  defineProperties(
    instance,
    entries(getAllDescriptors(instance))
    // make all descriptors parent chainable
      .reduce((acc, [key, descriptor]) => {
        let { value, get } = descriptor;

        // remove assert from nested interactors
        if (key === 'assert') {
          return assign(acc, {
            [key]: { value: undefined }
          });
        }

        // do not include the constructor, element getter, or other
        // non-configurable descriptors
        if (key === 'constructor' || key === '$element' ||
            descriptor.configurable === false) {
          return acc;
        }

        // make methods and getters chainable
        /* istanbul ignore else: sanity check */
        if (typeof value === 'function') {
          assign(descriptor, { value: chainable(value) });
        } else if (typeof get === 'function') {
          assign(descriptor, { get: chainable(get) });
        } else {
          return acc;
        }

        return assign(acc, { [key]: descriptor });
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
