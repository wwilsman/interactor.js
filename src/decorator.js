import Interactor from './interactor';
import from from './utils/from';

const {
  assign,
  entries,
  getPrototypeOf,
  getOwnPropertyDescriptors
} = Object;

function omit(obj, keys) {
  return entries(obj).reduce((o, [k, v]) => {
    return !keys.includes(k) ? assign(o, { [k]: v }) : o;
  }, {});
}

function parent(klass) {
  if (klass.prototype instanceof Interactor) {
    return getPrototypeOf(klass);
  } else {
    return Interactor;
  }
}

export default function interactor(classDescriptor) {
  /* istanbul ignore if: only encountered with stage-2 decorators */
  if (classDescriptor.kind === 'class') {
    let { kind, elements } = classDescriptor;

    return {
      kind,
      finisher: constructor => from.call(
        parent(constructor),
        // collect all element descriptors and own properties
        elements.reduce((acc, el) => assign({
          [el.key]: el.placement === 'own'
            ? el.initializer()
            : el.descriptor
        }, acc), {
          // include static properties (omitting the prototype and length properties)
          static: omit(getOwnPropertyDescriptors(constructor), ['prototype', 'length'])
        })
      )
    };

  // a class constructor was provided (legacy decorator syntax)
  } else if (typeof classDescriptor === 'function') {
    let constructor = classDescriptor;

    // make a pojo for `from`
    return from.call(parent(constructor), assign(
      // get own property initializers
      entries(getOwnPropertyDescriptors(new constructor()))
        .reduce((acc, [key, descr]) => {
          return ('value' in descr && descr.enumerable)
            ? assign(acc, { [key]: descr.value })
            : acc;
        }, {}),
      // prototype properties (omitting the constructor)
      omit(getOwnPropertyDescriptors(constructor.prototype), ['constructor']),
      // static properties (omitting the prototype and length properties)
      { static: omit(getOwnPropertyDescriptors(constructor), ['prototype', 'length']) }
    ));

  // catch everything else with a generic error
  } else {
    throw new Error(`Invalid argument: ${classDescriptor}`);
  }
}
