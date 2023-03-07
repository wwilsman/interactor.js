import m from '../meta.js';
import { assertion } from '../assert.js';
import { getPrototypeOf } from '../utils.js';

// creates an empty interactor to use as the parent when counting instance elements
function newEmptyInteractor(inst) {
  let I, proto;

  while ((proto = getPrototypeOf(proto || inst)) !== Object.prototype)
    I = proto.constructor;

  return m.new(I(), 'selector', null);
}

export function value(selector = '') {
  let parent = selector && this;

  if (!parent) {
    ({ parent, selector } = m.get(this));
    parent = parent || newEmptyInteractor(this);
  }

  return parent.$$(selector).length;
}

export const assert = assertion(function(selector, expected = selector) {
  selector = expected !== selector ? selector : '';
  let actual = value.call(this, selector);

  return {
    message: `found ${actual} element${actual === 1 ? '' : 's'} ` +
      `matching %{@ ${selector}} but expected %{- ${expected}|not to}`,
    result: actual === expected
  };
});
