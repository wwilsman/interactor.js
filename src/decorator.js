import from from './utils/from';

const {
  assign,
  entries,
  getOwnPropertyDescriptors
} = Object;

function omit(obj, key) {
  let { [key]: _, ...rest } = obj;
  return rest;
}

export default function interactor(classDescriptor) {
  if (classDescriptor.kind === 'class') {
    let { kind, elements } = classDescriptor;

    return {
      kind,
      finisher: constructor => from.call(
        constructor,
        // collect all element descriptors and own properties
        elements.reduce((acc, el) => assign({
          [el.key]: el.placement === 'own'
            ? el.initializer()
            : el.descriptor
        }, acc), {
          // include static properties
          static: assign({
            // name is usually non-enumerable
            name: constructor.name
          }, constructor)
        })
      )
    };

  // a class constructor was provided (legacy decorator syntax)
  } else if (typeof classDescriptor === 'function') {
    let constructor = classDescriptor;

    // make a pojo for `from`
    return from.call(constructor, assign(
      // get own property initializers
      entries(getOwnPropertyDescriptors(new constructor()))
        .reduce((acc, [key, descr]) => {
          return ('value' in descr && descr.enumerable)
            ? assign(acc, { [key]: descr.value })
            : acc;
        }, {}),
      // prototype properties (omitting the constructor)
      omit(getOwnPropertyDescriptors(constructor.prototype), 'constructor'),
      // static properties (name is usually non-enumerable)
      { static: assign({ name: constructor.name }, constructor) }
    ));

  // catch everything else with a generic error
  } else {
    throw new Error(`Invalid argument: ${classDescriptor}`);
  }
}
