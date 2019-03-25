import meta, { get, set } from './meta';

const {
  assign,
  defineProperties,
  entries,
  freeze,
  getPrototypeOf,
  getOwnPropertyDescriptors
} = Object;

function getScopeName(interactor) {
  let { scope, parent, detached } = get(interactor);

  if (typeof scope === 'string') {
    return `"${scope}"`;
  } else if (scope == null && parent && !detached) {
    return getScopeName(parent);
  } else {
    return interactor.constructor.name;
  }
}

function getAllAssertions(interactor) {
  let proto = interactor.constructor.prototype;
  let matchers = {};

  while (proto && proto !== Object.prototype) {
    matchers = assign({}, proto.assert, matchers);
    proto = getPrototypeOf(proto);
  }

  return matchers;
}

function validate(interactor) {
  let {
    format,
    remains,
    validations
  } = get(interactor, 'assert');

  function assertion() {
    return validations.reduce((ret, matcher) => {
      let { name, validate, args, expected } = matcher;
      let result, message;

      try {
        result = validate.apply(this, args);
      } catch (e) {
        result = false;
        message = () => e.message;
      }

      if (result && getPrototypeOf(result) === Object.prototype) {
        ({ result, message } = result);
      }

      if (!message) {
        message = (typeof result === 'undefined' && !expected)
          ? () => `\`${name}\` did not throw an error`
          : () => `\`${name}\` returned ${result}`;
      }

      let pass = typeof result === 'undefined' || !!result;

      if (pass !== expected) {
        throw new Error(
          format
            .replace('%s', getScopeName(this))
            .replace('%e', message())
        );
      }

      return result || ret;
    }, undefined);
  }

  let next = set(interactor, 'assert', null).when(assertion);
  return !remains ? next : next.always(assertion, remains);
}

function assert(assertion) {
  let { validations } = get(this, 'assert');

  return set(this, 'assert', {
    validations: validations.concat({
      name: 'assertion',
      expected: true,
      validate() {
        let arg = assertion.length ? this.$element : undefined;
        return assertion.call(this, arg);
      }
    })
  });
}

const assertProto = {
  get not() {
    let next = set(this[meta], 'assert', { expected: false });
    return next.assert;
  },

  f(format) {
    return set(this[meta], 'assert', { format });
  },

  remains(timeout) {
    let next = set(this[meta], 'assert', { remains: timeout });
    return next.assert.validate();
  },

  validate() {
    let { validations } = get(this[meta], 'assert');
    return validations.length ? validate(this[meta]) : this[meta];
  }
};

export function getAssertFor(interactor) {
  return freeze(
    defineProperties(
      assign(
        assert.bind(interactor),
        getAllAssertions(interactor),
        { [meta]: interactor }
      ),
      getOwnPropertyDescriptors(
        assertProto
      )
    )
  );
}

export default function createAsserts(matchers) {
  return freeze(
    entries(matchers).reduce((assertions, [name, validate]) => {
      return assign(assertions, {
        [name](...args) {
          let { validations, expected } = get(this[meta], 'assert');
          validations = validations.concat({ name, args, expected, validate });
          return set(this[meta], 'assert', { validations, expected: true });
        }
      });
    }, {})
  );
}
