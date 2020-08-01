import m from './meta';
import { assign, map, named } from './utils';
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

export * as by from './selectors';
export { default as when } from './when';
export { default as InteractorError } from './error';
export default Interactor;
