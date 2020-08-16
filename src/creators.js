import m from './meta';
import { assign, map, named } from './utils';
import { createAssert } from './assert';
import error from './error';
import when from './when';

import Interactor from './interactor';
import * as actions from './actions';
import * as properties from './properties';

// turn action methods into interactor action creators
assign(exports, map(actions, (action, name) => {
  return named(name, (selector, ...args) => action.apply((
    m.get(selector, 'queue') ? selector : Interactor(selector)
  ), args));
}));

// turn interactor properties into property creators
assign(exports, map(properties, ({ get, value, assert }, name) => {
  return named(name, (...args) => {
    let selector = get || (value && args.length > value.length) ? args.shift() : '';
    let assertion = assert || createAssert(name, get || value);
    let ctx = i => selector ? i.find(selector) : i;

    let thennable = when(() => {
      if (!selector) throw error('an element selector is required when awaiting on properties');
      return (get || value).apply(Interactor(selector), args);
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
