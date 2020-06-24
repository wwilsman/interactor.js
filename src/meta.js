import {
  assign,
  defineProperty,
  freeze,
  now,
  random,
  round
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
    let meta = typeof key === 'string' ? {
      [key]: typeof val === 'function'
        ? val(m.get(inst, key)) : val
    } : key;

    return defineProperty(inst, sym, {
      // frozen to prevent accidental mutation
      value: freeze(assign({
        // will be overridden with any existing ID; used to determine interactor uniqueness across
        // chained instances to avoid interactor collisions
        id: round(random() * now())
      }, m.get(inst), meta)),
      configurable: true,
      enumerable: false
    });
  },

  // Returns a new instance with copied and additional metadata. Setting the queue will set it on
  // and return the topmost parent interactor via recursion. Given a function value, the instance
  // queue will be concatenated into the parent queue before the function is called
  new(inst, key, val) {
    if (key === 'queue') {
      let { parent, queue } = m.get(inst);

      if (parent) {
        return m.new(parent, key, q => (
          val(q.concat(queue))
        ));
      }
    }

    return m.set((
      m.set(new inst.constructor(), m.get(inst))
    ), key, val);
  },

  // Returns true when two instances have the same metadata ID
  eq(a, b) {
    return m.get(a, 'id') === m.get(b, 'id');
  }
};

export default m;
