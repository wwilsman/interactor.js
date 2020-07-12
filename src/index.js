import m from './meta';
import { assign, map } from './utils';

import Interactor from './interactor';
import actions from './actions';

// turn action methods into interactor action creators
assign(exports, map(actions, action => {
  return (selector, ...args) => action.apply((
    m.get(selector, 'queue') ? selector : Interactor(selector)
  ), args);
}));

export * from './selectors';
export { default as when } from './when';
export { default as InteractorError } from './error';
export default Interactor;
