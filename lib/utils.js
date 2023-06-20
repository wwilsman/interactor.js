const {
  now
} = Date;

const {
  random,
  round
} = Math;

const {
  assign,
  create,
  defineProperty,
  defineProperties,
  entries,
  freeze,
  getOwnPropertyDescriptor,
  getOwnPropertyDescriptors,
  getPrototypeOf,
  hasOwn
} = Object;

// built-ins that are handy to import from one place
export {
  assign,
  create,
  defineProperty,
  defineProperties,
  entries,
  freeze,
  getOwnPropertyDescriptor,
  getOwnPropertyDescriptors,
  getPrototypeOf,
  hasOwn,
  now,
  random,
  round
};

export function named(name, fn) {
  return defineProperty(fn, 'name', { value: name });
}

// Maps an object's key value pairs to another object. Returning undefined or null from the map
// function will omit the entry from the resulting object.
export function map(obj, fn) {
  return !obj ? {} : entries(obj)
    .reduce((result, [k, v]) => {
      let value = fn(v, k);

      return value != null
        ? assign(result, { [k]: value })
        : result;
    }, create(null));
}

// Recurses through an object and its prototype to gather property descriptors and map over them.
export function mapPropertyDescriptors(obj, fn) {
  let descr = getOwnPropertyDescriptors(obj);
  let proto = getPrototypeOf(obj);

  while (proto && proto !== Object.prototype) {
    // prioritize previous descriptors higher in the prototype chain
    descr = assign(getOwnPropertyDescriptors(proto), descr);
    proto = getPrototypeOf(proto);
  }

  return map(descr, fn);
}
