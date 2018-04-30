/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, is } from '../../src';

const IsInteractor = interactor(function() {
  this.isRoot = is('[data-root]');
  this.testFirst = is('.test-p:first-child', '[data-test]');
  this.testLast = is('.test-p:last-child', '[data-test]');
});

describe('BigTest Interaction: is', () => {
  let test;

  useFixture('is-fixture');

  beforeEach(() => {
    test = new IsInteractor('#scoped');
  });

  it('has is properties', () => {
    expect(test).to.have.property('isRoot').that.is.a('boolean');
    expect(test).to.have.property('testFirst').that.is.a('boolean');
  });

  it('returns true if the selector matches', () => {
    expect(test.isRoot).to.be.true;
    expect(test.testFirst).to.be.true;
  });

  it('returns false if the selector does not match', () => {
    expect(test.testLast).to.be.false;
  });
});
