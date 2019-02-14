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
