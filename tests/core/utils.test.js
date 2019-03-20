import expect from 'expect';

import {
  Convergence,
  Interactor,
  isConvergence,
  isInteractor
} from 'interactor.js';

describe('Interactor utils - isConvergence', () => {
  it('returns true for convergence instances', () => {
    expect(isConvergence(new Convergence())).toBe(true);
    expect(isConvergence(new Interactor())).toBe(true);
  });

  it('returns false for everything else', () => {
    expect(isConvergence({})).toBe(false);
    expect(isConvergence(true)).toBe(false);
    expect(isConvergence('string')).toBe(false);
    expect(isConvergence(1)).toBe(false);
  });
});

describe('Interactor utils - isInteractor', () => {
  it('returns true for interactor instances', () => {
    expect(isInteractor(new Interactor())).toBe(true);
  });

  it('returns false for everything else', () => {
    expect(isInteractor(new Convergence())).toBe(false);
    expect(isInteractor({})).toBe(false);
    expect(isInteractor(true)).toBe(false);
    expect(isInteractor('string')).toBe(false);
    expect(isInteractor(1)).toBe(false);
  });
});
