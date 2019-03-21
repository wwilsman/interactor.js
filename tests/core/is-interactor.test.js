import expect from 'expect';

import {
  Interactor,
  isInteractor
} from 'interactor.js';

describe('Interactor utils - isInteractor', () => {
  it('returns true for interactor instances', () => {
    expect(isInteractor(new Interactor())).toBe(true);
  });

  it('returns false for everything else', () => {
    expect(isInteractor({})).toBe(false);
    expect(isInteractor(true)).toBe(false);
    expect(isInteractor('string')).toBe(false);
    expect(isInteractor(1)).toBe(false);
  });
});
