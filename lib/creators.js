import m from './meta.js';
import { assign, map, named } from './utils.js';
import { createAssert } from './assert.js';
import error from './error.js';
import when from './when.js';

import Interactor from './interactor.js';
import * as actions from './actions.js';
import * as properties from './properties.js';

// turn action methods into interactor action creators
assign(Interactor, map(actions, (action, name) => {
  return named(name, (selector, ...args) => action.apply((
    m.get(selector, 'queue') ? selector : Interactor.find(selector)
  ), args));
}));

// turn interactor properties into property creators
assign(Interactor, map(properties, ({ get, value, assert }, name) => {
  return named(name, (...args) => {
    let selector = get || (value && args.length > value.length) ? args.shift() : '';
    let assertion = assert || createAssert(name, get || value);
    let ctx = i => selector ? i.find(selector) : i;

    let thennable = when(() => {
      if (!selector) throw error('an element selector is required when awaiting on properties');
      return (get || value).apply(Interactor.find(selector), args);
    });

    return {
      then: thennable.then,
      catch: thennable.catch,

      get() {
        return (get || value).apply(ctx(this), args);
      },

      assert(expected, ...a) {
        return ctx(this).assert(named(name, function() {
          assertion.apply(this, [expected].concat(args, a));
        }));
      }
    };
  });
}));
