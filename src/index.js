import Interactor from './interactor';
import from, { toInteractorProperties } from './utils/from';
import createAsserts, { getAssertFor } from './utils/assert';
import { chainAssert } from './utils/chainable';
import meta, { set } from './utils/meta';

// property creators
import checked from './properties/checked';
import disabled from './properties/disabled';
import exists from './properties/exists';
import focusable from './properties/focusable';
import focused from './properties/focused';
import selected from './properties/selected';
import scrollable, { scrollableX, scrollableY } from './properties/scrollable';
import text from './properties/text';
import value from './properties/value';

// interactions
import blur from './actions/blur';
import check, { uncheck } from './actions/check';
import click from './actions/click';
import focus from './actions/focus';
import scroll from './actions/scroll';
import select from './actions/select';
import trigger from './actions/trigger';
import keydown from './actions/keydown';
import keyup from './actions/keyup';
import press from './actions/press';
import type from './actions/type';

// helper methods
import scoped from './helpers/scoped';
import attribute from './helpers/attribute';
import count from './helpers/count';
import property from './helpers/property';
import matches from './helpers/matches';

// assertions
import * as assertions from './assertions';

const {
  assign,
  defineProperties,
  entries
} = Object;

// some static properties defined here to avoid circular imports
defineProperties(Interactor, {
  // static bound scoped helper for subclasses
  scoped: {
    get() { return selector => scoped(selector, this); }
  },

  // bound from utility for subclasses
  from: {
    get() { return from.bind(this); }
  }
});

const builtIn = toInteractorProperties({
  // properties
  ...(entries({
    checked,
    disabled,
    exists,
    focusable,
    focused,
    selected,
    scrollable,
    scrollableX,
    scrollableY,
    text,
    value
  }).reduce((acc, [key, creator]) => {
    let { [meta]: m, ...descr } = creator();
    // default property assertions may be given a selector
    // (handled when assertions are created from computed matchers)
    assign(descr, { [meta]: { ...m, selector: true } });
    return assign(acc, { [key]: descr });
  }, {})),
  // interactions
  blur,
  check,
  click,
  focus,
  keydown,
  keyup,
  press,
  scroll,
  select,
  trigger,
  type,
  uncheck,
  // helpers
  scoped,
  attribute,
  count,
  property,
  matches
});

// built-in methods & properties
defineProperties(
  Interactor.prototype,
  builtIn.descriptors
);

// assertions
defineProperties(Interactor.prototype, {
  assert: {
    value: createAsserts({
      ...builtIn.assertions,
      ...assertions,

      // defined here to avoid circular imports
      scoped: {
        value(...args) {
          let next = set(scoped(...args), { parent: this[meta] });
          return chainAssert(getAssertFor(next));
        }
      }
    })
  }
});

export {
  Interactor,
  from,
  // property creators
  checked,
  disabled,
  exists,
  focusable,
  focused,
  selected,
  scrollable,
  scrollableX,
  scrollableY,
  text,
  value,
  // interactions
  blur,
  check,
  click,
  focus,
  keydown,
  keyup,
  press,
  scroll,
  select,
  trigger,
  type,
  uncheck,
  // helpers
  scoped
};

// other exports
export { default as attribute } from './properties/attribute';
export { default as count } from './properties/count';
export { default as property } from './properties/property';
export { default as matches } from './properties/matches';
export { default as collection } from './helpers/collection';
export { default as computed } from './helpers/computed';
export { default as isInteractor } from './utils/is-interactor';
export { when, always } from './helpers/converge';
export { default } from './decorator';
