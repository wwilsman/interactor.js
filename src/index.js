import Convergence from './convergence';
import Interactor from './interactor';
import { wrap } from './utils/from';
import createAsserts from './utils/assert';

// property creators
import disabled from './properties/disabled';
import exists from './properties/exists';
import focusable from './properties/focusable';
import focused from './properties/focused';
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
import type from './actions/type';

// helper methods
import scoped from './helpers/scoped';
import attribute from './helpers/attribute';
import property from './helpers/property';
import matches from './helpers/matches';

// assertions
import * as assertions from './assertions';

const {
  assign,
  defineProperties,
  entries
} = Object;

// property creators
defineProperties(
  Interactor.prototype,
  entries({
    disabled,
    exists,
    focusable,
    focused,
    scrollable,
    scrollableX,
    scrollableY,
    text,
    value
  }).reduce((descriptors, [name, creator]) => {
    return assign(descriptors, {
      [name]: creator()
    });
  }, {})
);

// interactions / methods
defineProperties(
  Interactor.prototype,
  entries({
    blur,
    check,
    click,
    focus,
    scroll,
    select,
    trigger,
    type,
    uncheck,
    scoped,
    attribute,
    property,
    matches
  }).reduce((descriptors, [name, method]) => {
    return assign(descriptors, {
      [name]: {
        value: wrap(method)
      }
    });
  }, {})
);

// assertions
defineProperties(Interactor.prototype, {
  assert: {
    value: createAsserts(assertions)
  }
});

export {
  Interactor,
  Convergence,
  // property creators
  disabled,
  exists,
  focusable,
  focused,
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
export { default as property } from './properties/property';
export { default as matches } from './properties/matches';
export { default as collection } from './helpers/collection';
export { default as isConvergence } from './utils/is-convergence';
export { default as isInteractor } from './utils/is-interactor';
export { when, always } from './helpers/converge';
export { default } from './decorator';
