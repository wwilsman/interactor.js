import Interactor from './interactor.js';
import * as actions from './actions/index.js';
import * as assertions from './assertions/index.js';

Interactor.defineActions(actions);
Interactor.defineAssertions(assertions);

export { Arrangement } from './arrangement.js';
export { Assert } from './assert.js';
export { Assertion } from './assertion.js';
export { Context } from './context.js';
export { Interaction } from './interaction.js';
export { Interactor } from './interactor.js';

/** @type {import('./interactor').Interactor} */
export const I = new Interactor();
export default I;
