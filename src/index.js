import m from './meta';
import { assign, map, named } from './utils';
import { createAssert } from './assert';
import { defineInteractorProperties } from './extend';

import Interactor from './interactor';
import * as actions from './actions';
import * as properties from './properties';

// define default action methods and interactor properties
assign(Interactor.prototype, actions);
defineInteractorProperties(Interactor, properties);

// turn action methods into interactor action creators
assign(exports, map(actions, (action, name) => {
  return named(name, (selector, ...args) => action.apply((
    m.get(selector, 'queue') ? selector : Interactor(selector)
  ), args));
}));

// turn interactor properties into property creators
assign(exports, map(properties, ({ get, call, assert }, name) => {
  return named(name, (...args) => {
    let selector = get || (call && args.length > call.length) ? args.shift() : '';
    let assertion = assert || createAssert(name, get/* || call - unused */);

    return {
      get() {
        return (get || call).apply(this.find(selector), args);
      },

      assert(expected, ...a) {
        return this.find(selector).assert(named(name, function() {
          assertion.apply(this, [expected].concat(args, a));
        }));
      }
    };
  });
}));

export * as by from './selectors';
export { assertion } from './assert';
export { default as when } from './when';
export { default as InteractorError } from './error';
export default Interactor;
