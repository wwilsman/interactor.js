import {
  assign,
  defineProperty,
  freeze,
  now,
  random,
  round,
  map
} from './utils';

// Symbol used to reference interactor metadata.
const sym = Symbol('interactor.meta');

// Meta namespace
const m = {

  // Retrieve metadata from an instance. Returns the meta object when a key is omitted.
  get(inst, key) {
    let meta = inst?.[sym] || {};
    return key ? meta[key] : meta;
  },

  // Set metadata on an instance and return the instance. The second argument can be an object to
  // set multiple values. If given a key-value pair, and the value is a function, it will be called
  // with the previous metadata and the return value will become the new metadata.
  set(inst, key, val) {
    if (typeof key === 'string') {
      return m.set(inst, { [key]: val });
    }

    return defineProperty(inst, sym, {
      enumerable: false,
      configurable: true,
      // frozen to prevent accidental mutation
      value: freeze(assign({
        // will be overridden with any existing ID; used to determine interactor uniqueness across
        // chained instances to avoid interactor collisions
        id: round(random() * now())
      }, m.get(inst), map(key, (next, key) => {
        let prev = m.get(inst, key);

        switch (key) {
          case 'queue':
            return (prev || []).concat(next);
          case 'keyboard':
          case 'assertions':
          case 'children':
            return assign({}, prev, next);
          default:
            return next;
        }
      }, {})))
    });
  },

  // Retrieve the contextual top parent instance.
  top(inst, topmost) {
    let { top, parent } = m.get(inst);
    return !parent || (!topmost && top) ? inst : m.top(parent);
  },

  // Returns a new instance with copied and additional metadata. Setting the parent meta will also
  // set the top meta to false, and setting the nested meta will set both the parent and top meta.
  new(inst, key, val) {
    if (key === 'parent') {
      return m.new(inst, { parent: val, top: false });
    } else {
      return m.set(m.set(new inst.constructor(), m.get(inst)), key, val);
    }
  },

  // Returns true when two instances have the same metadata ID
  eq(a, b) {
    return m.get(a, 'id') === m.get(b, 'id');
  }
};

export default m;
