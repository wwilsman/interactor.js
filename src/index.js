import m from './meta';
import { assign, map } from './utils';

import Interactor from './interactor';
import * as actions from './actions';

assign(exports, map(actions, action => {
  return function(...args) {
    return action.apply((
      m.get(this, 'queue') ? this
        : Interactor(args.shift())
    ), args);
  };
}));

export * from './selectors';
export { default as when } from './when';
export { default as InteractorError } from './error';
export default Interactor;
