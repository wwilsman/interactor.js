/* global describe, beforeEach, it */
import { expect } from 'chai';
import { Interactor, interactor } from '../src';

describe('BigTest Interaction: decorator', () => {
  let TestInteractor;

  beforeEach(() => {
    TestInteractor = interactor(class TestInteractor {
      constructor() {
        this.foo = 'bar';

        this.test = {
          enumerable: false,
          configurable: false,
          value() {}
        };

        this.nested = new Interactor();
      }

      get getter() {
        return 'got';
      }
    });
  });

  it('retains the class name', () => {
    expect(TestInteractor.name).to.equal('TestInteractor');
  });

  it('extends the interactor class', () => {
    expect(new TestInteractor()).to.be.an.instanceof(Interactor);
  });

  it('sets instance initializers on the prototype', () => {
    expect(TestInteractor.prototype).to.have.property('foo', 'bar');
    expect(new TestInteractor()).to.have.property('foo', 'bar');
  });

  it('preserves property descriptors', () => {
    expect(TestInteractor.prototype).to.have.property('getter', 'got');
    expect(new TestInteractor()).to.have.property('getter', 'got');
  });

  it('uses descriptors from instance initializers', () => {
    expect(TestInteractor.prototype).to.respondTo('test');
    expect(new TestInteractor()).to.respondTo('test');
  });

  it('attaches a parent to nested interactors', () => {
    expect(new TestInteractor().nested).to.be.an.instanceOf(Interactor);
    expect(new TestInteractor().nested).to.not.be.an.instanceOf(TestInteractor);
    expect(new TestInteractor().nested.parent).to.be.an.instanceOf(TestInteractor);
  });

  it('throws an error when attempting to redefine existing properties', () => {
    expect(() => interactor(class { get find() {} }))
      .to.throw('cannot redefine existing property "find"');
  });
});
