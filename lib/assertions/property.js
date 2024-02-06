import Assertion from '../assertion.js';

function get(object, path) {
  return path.split('.').reduce((t, k) => t?.[k], object);
}

export class PropertyAssertion extends Assertion {
  constructor(name, expected) {
    super(({ $ }) => get($, name) === expected,
      ({ $ }) => `#{this} \`${name}\` is \`${get($, name)}\` but expected \`${expected}\``,
      `#{this} \`${name}\` is \`${expected}\` but expected it not to be`
    );
  }
}

export default PropertyAssertion;
