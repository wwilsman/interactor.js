/* global describe, beforeEach, it, Element */
import { expect } from 'chai';
import Convergence from '@bigtest/convergence';
import { useFixture } from './helpers';
import Interactor from '../src/interactor';

describe('BigTest Interaction: Interactor', () => {
  let instance;

  beforeEach(() => {
    instance = new Interactor();
  });

  it('creates a new instance', () => {
    expect(instance).to.be.an.instanceOf(Interactor);
  });

  it('extends the convergence class', () => {
    expect(instance).to.be.an.instanceOf(Convergence);
  });

  it('has a `pause` method', () => {
    expect(instance).to.respondTo('pause');
    expect(instance.pause()).to.be.an.instanceOf(Interactor);
    expect(instance.pause()).to.not.equal(instance);
  });

  describe('with a scope', () => {
    useFixture('scoped-fixture');

    it('has a default scope', () => {
      expect(instance.$root).to.equal(document.body);
    });

    it('can be scoped by selector', () => {
      let scoped = new Interactor('#scoped');

      expect(scoped.$root).to.not.equal(document.body);
      expect(scoped.$root.id).to.equal('scoped');
    });

    it('can be scoped by element', () => {
      let $scope = document.getElementById('scoped');
      let scoped = new Interactor($scope);

      expect(scoped.$root).to.not.equal(document.body);
      expect(scoped.$root).to.equal($scope);
    });

    it('throws when scope does not exist', () => {
      let scoped = new Interactor('#not-scoped').timeout(50);
      expect(() => scoped.$root).to.throw('unable to find "#not-scoped"');
    });

    it('can have an evaulated scope', () => {
      let scopeID;
      let scoped = new Interactor(() => `#${scopeID}`);

      scopeID = 'scoped';
      expect(scoped.$root.id).to.equal('scoped');

      scopeID = 'not-scoped';
      expect(() => scoped.$root).to.throw('unable to find "#not-scoped"');
    });

    describe('and a custom default scope', () => {
      class ScopedInteractor extends Interactor {}
      Object.defineProperty(ScopedInteractor, 'defaultScope', { value: '#scoped' });

      it('uses the custom default scope', () => {
        let scoped = new ScopedInteractor();

        expect(scoped.$root).to.not.equal(document.body);
        expect(scoped.$root.id).to.equal('scoped');
      });

      it('can still override the scope', () => {
        let scoped = new ScopedInteractor(document.body);
        expect(scoped.$root).to.equal(document.body);
      });
    });
  });

  describe('with a parent', () => {
    let child;

    class ParentInteractor extends Interactor {}
    class ChildInteractor extends Interactor {
      test1() { return this.do(() => {}); }
      test2() { return this.test1().test1(); }
      test3() { return instance; }
    }

    beforeEach(() => {
      child = new ChildInteractor({
        parent: new ParentInteractor()
      });
    });

    it('is an instance of the current interactor', () => {
      expect(child).to.be.an.instanceof(ChildInteractor);
    });

    it('contains a reference to the parent instance', () => {
      expect(child.parent).to.be.an.instanceof(ParentInteractor);
    });

    it('returns a new parent instance from methods', () => {
      expect(child.test1()).to.be.an.instanceof(ParentInteractor);
    });

    it('returns a new parent instance from complex methods', () => {
      expect(child.test2()).to.be.an.instanceof(ParentInteractor);
    });

    it('does not return a new parent when a new child is not returned', () => {
      expect(child.test3()).to.not.be.an.instanceof(ChildInteractor);
      expect(child.test3()).to.not.be.an.instanceof(ParentInteractor);
    });

    describe('and deeply nested', () => {
      let deep;

      class DeepInteractor extends Interactor {
        test() { return this.do(() => {}); }
      }

      beforeEach(() => {
        deep = new DeepInteractor({
          parent: child
        });
      });

      it('contains a reference to the immediate parent', () => {
        expect(deep.parent).to.be.an.instanceof(ChildInteractor);
        expect(deep.parent.parent).to.be.an.instanceof(ParentInteractor);
      });

      it('returns a new instance of the topmost parent from methods', () => {
        expect(deep.test()).to.be.an.instanceof(ParentInteractor);
      });
    });
  });

  describe('DOM helpers', () => {
    useFixture('find-fixture');

    it('has a helper for finding a single DOM element', () => {
      expect(new Interactor().$('.test-p')).to.be.an.instanceOf(Element);
      expect(new Interactor('.test-p').$()).to.be.an.instanceOf(Element);
    });

    it('throws when finding a single element that does not exist', () => {
      expect(() => new Interactor().$('.non-existent'))
        .to.throw('unable to find ".non-existent"');
    });

    it('has a helper for finding multiple DOM elements', () => {
      expect(new Interactor().$$('.test-p')).to.have.lengthOf(2);
      expect(new Interactor('.test-p').$$()).to.have.lengthOf(0);
    });
  });
});
