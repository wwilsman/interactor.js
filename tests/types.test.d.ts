/**
 * Type declarations for dynamically defined test properties in interactor.test.js
 *
 * The defineAction() and defineAssertion() methods add properties at runtime via Object.defineProperty().
 * TypeScript can't infer these, so we manually declare them here.
 */

import { Interactor, Assert } from 'interactor.js';

// Declare the test method on TestInteractor instances used in defineAction tests
export interface TestInteractor extends Interactor {
  test?(...args: any[]): any;

  assert: Interactor.assert & {
    test?(...args: any[]): any
  };
}
