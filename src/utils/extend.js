const {
  assign,
  getOwnPropertyDescriptors,
  getPrototypeOf
} = Object;

function omit(obj, key) {
  let { [key]: _, ...rest } = obj;
  return rest;
}

export default function extend(classDescriptor) {
  if (classDescriptor.kind === 'class') {
    let { kind, elements } = classDescriptor;

    return {
      kind,
      finisher: constructor => {
        return this.from(
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
        );
      }
    };

  // a class constructor was provided (legacy decorator syntax)
  } else if (typeof classDescriptor === 'function') {
    let constructor = classDescriptor;

    // make a pojo for `from`
    return this.from(assign({},
      // own properties
      new constructor(),
      // prototype properties
      omit(getOwnPropertyDescriptors(constructor.prototype), 'constructor'),
      // static properties (name is usually non-enumerable)
      { static: assign({ name: constructor.name }, constructor) }
    ));

  // plain objects are deprecated
  } else if (getPrototypeOf(classDescriptor) === Object.prototype) {
    console.warn(`Deprecated usage of decorator with plain objects. Use \`${this.name}.from\` instead.`);
    return this.from(classDescriptor);

  // catch everything else with a generic error
  } else {
    throw new Error(`Invalid argument: ${classDescriptor}`);
  }
}
