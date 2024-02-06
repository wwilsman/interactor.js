import { Chainable } from './chainable';
import { Assertion } from './assertion';
import { Interaction } from './interaction';
import { Interactor } from './interactor';

declare type InteractorMethod<T extends (
  ((...args: any) => any) |
  (new (...args: any) => Interaction)
), I = Interactor> = (
  T extends (...args: infer A) => infer R ?
    (...args: A) => Chainable<Interaction, I, R> :
  T extends new (...args: infer A) => infer TR ?
    (...args: A) => Chainable<TR, I, TR extends Interaction<infer R> ? R : never> :
  never
)

declare type AssertMethod<T extends (
  ((...args: any) => any) |
  (new (...args: any) => Assertion)
), I = Interactor> = (
  T extends (...args: infer A) => any ?
    (...args: A) => Chainable<Assertion, I, boolean> :
  T extends new (...args: infer A) => Assertion ?
    (...args: A) => Chainable<T, I, boolean> :
  never
)

declare module './interactor' {
  interface Interactor {
    constructor: typeof Interactor

    blur: InteractorMethod<typeof import('./actions/blur').default>
    click: InteractorMethod<typeof import('./actions/click').default>
    focus: InteractorMethod<typeof import('./actions/focus').default>
    press: InteractorMethod<typeof import('./actions/press').default>
    trigger: InteractorMethod<typeof import('./actions/trigger').default>
    type: InteractorMethod<typeof import('./actions/type').default>
  }
}

declare module './assert' {
  interface Assert {
    attribute: AssertMethod<typeof import('./assertions/attribute').default>
    checked: AssertMethod<typeof import('./assertions/checked').default>
    disabled: AssertMethod<typeof import('./assertions/disabled').default>
    exists: AssertMethod<typeof import('./assertions/exists').default>
    focusable: AssertMethod<typeof import('./assertions/focusable').default>
    focused: AssertMethod<typeof import('./assertions/focused').default>
    matches: AssertMethod<typeof import('./assertions/matches').default>
    overflows: AssertMethod<typeof import('./assertions/overflows').default>
    property: AssertMethod<typeof import('./assertions/property').default>
    scrollable: AssertMethod<typeof import('./assertions/scrollable').default>
    selected: AssertMethod<typeof import('./assertions/selected').default>
    text: AssertMethod<typeof import('./assertions/text').default>
    value: AssertMethod<typeof import('./assertions/value').default>
    visible: AssertMethod<typeof import('./assertions/visible').default>
  }
}

export * from './index';
