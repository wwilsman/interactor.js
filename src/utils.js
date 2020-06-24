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
  freeze,
  getOwnPropertyDescriptors,
  getPrototypeOf,
  keys
} = Object;

// built-ins that are handy to import from one place
export {
  assign,
  create,
  defineProperty,
  defineProperties,
  freeze,
  now,
  random,
  round
};

// Recurses through an object and its prototype to gather property descriptors and map over
// them. Returning falsy from the map function will omit the entry from the resulting object.
export function mapPropertyDescriptors(obj = {}, map) {
  let descr = getOwnPropertyDescriptors(obj);
  let proto = getPrototypeOf(obj);

  while (proto && proto !== Object.prototype) {
    // prioritize previous descriptors higher in the prototype chain
    descr = assign(getOwnPropertyDescriptors(proto), descr);
    proto = getPrototypeOf(proto);
  }

  return keys(descr).reduce((p, k) => {
    let d = map(descr[k], k);
    return d ? assign(p, { [k]: d }) : p;
  }, create(null));
}
