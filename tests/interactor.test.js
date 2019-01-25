import expect from 'expect';
import Convergence from '@bigtest/convergence';

import { $, injectHtml } from './helpers';
import Interactor from '../src/interactor';

describe('Interactor', () => {
  let instance;

  beforeEach(() => {
    instance = new Interactor();
  });

  it('creates a new instance', () => {
    expect(instance).toBeInstanceOf(Interactor);
  });

  it('extends the convergence class', () => {
    expect(instance).toBeInstanceOf(Convergence);
  });

  describe('with a scope', () => {
    beforeEach(() => {
      injectHtml(`
        <p class="test-p">A</p>
        <div id="scoped">
          <p class="test-p">B</p>
        </div>
      `);
    });

    it('has a default scoped element', () => {
      expect(instance.$element).toBe(document.body);
    });

    it('can be scoped by selector', () => {
      let scoped = new Interactor('#scoped');
      expect(scoped.$element).not.toBe(document.body);
      expect(scoped.$element.id).toEqual('scoped');
    });

    it('can be scoped by element', () => {
      let $scope = $('#scoped');
      let scoped = new Interactor($scope);
      expect(scoped.$element).not.toBe(document.body);
      expect(scoped.$element).toBe($scope);
    });

    it('throws when scope does not exist', () => {
      let scoped = new Interactor('#not-scoped');
      expect(() => scoped.$element).toThrow('unable to find "#not-scoped"');
    });

    it('throws when the selector is invalid', () => {
      let scoped = new Interactor('.#not-valid');
      expect(() => scoped.$element).toThrow(SyntaxError);
      expect(() => scoped.$element).toThrow('".#not-valid" is not a valid selector');
    });

    it('can have an evaulated scope', () => {
      let scopeID;
      let scoped = new Interactor(() => `#${scopeID}`);

      scopeID = 'scoped';
      expect(scoped.$element.id).toBe('scoped');

      scopeID = 'not-scoped';
      expect(() => scoped.$element).toThrow('unable to find "#not-scoped"');
    });

    it('can find a single DOM element within the scope', () => {
      expect(new Interactor().$('.test-p').innerText).toBe('A');
      expect(new Interactor('#scoped').$('.test-p').innerText).toBe('B');
    });

    it('throws when finding a single element that does not exist', () => {
      expect(() => new Interactor().$('.non-existent'))
        .toThrow('unable to find ".non-existent"');
    });

    it('has a helper for finding multiple DOM elements', () => {
      expect(new Interactor().$$('.test-p')).toHaveLength(2);
      expect(new Interactor('.test-p').$$()).toHaveLength(0);
    });

    describe('with a custom default scope', () => {
      class ScopedInteractor extends Interactor {
        static defaultScope = '#scoped';
      }

      it('uses the custom default scope', () => {
        let scoped = new ScopedInteractor();

        expect(scoped.$element).not.toBe(document.body);
        expect(scoped.$element.id).toBe('scoped');
      });

      it('can still override the scope', () => {
        let scoped = new ScopedInteractor('.test-p');
        expect(scoped.$element.id).toBe('');
      });
    });

    describe('with nested interactors and actions', () => {
      let TestInteractor;

      beforeEach(() => {
        TestInteractor = @Interactor.extend class {
          nested = new Interactor('.test-p');

          scoped = new Interactor({
            scope: '.test-p',
            detached: false
          });

          action = new Interactor({
            scope: '.test-p',
            detached: false
          }).do(function() {
            let parentId = this.$element.parentNode.id;
            expect(parentId).toBe('scoped');
          });
        };
      });

      it('has the correct scope', () => {
        let test = new TestInteractor('#scoped');
        expect(test.nested.$element.innerText).toBe('A');
        expect(test.scoped.$element.innerText).toBe('B');
      });

      it('creates a method when the interactor has actions', async () => {
        expect(TestInteractor.prototype).toHaveProperty('action', expect.any(Function));
        let test = new TestInteractor('#scoped').action();
        expect(test).toBeInstanceOf(TestInteractor);
        await expect(test).resolves.toBeUndefined();
      });
    });
  });

  describe('nesting other interactors', () => {
    let parent;

    class ParentInteractor extends Interactor {
      get child() {
        return new ChildInteractor({
          parent: this,
          chain: true
        });
      }
    }

    class ChildInteractor extends Interactor {
      test1() { return this.do(() => {}); }
      test2() { return this.test1().test1(); }
      test3() { return instance; }

      deep() {
        return new DeepInteractor({
          parent: this,
          chain: true
        });
      }

      test4() {
        return this.deep().test().deep().test();
      }
    }

    class DeepInteractor extends Interactor {
      test() { return this.do(() => {}); }
    }

    beforeEach(() => {
      parent = new ParentInteractor();
    });

    it('returns an instance of the child interactor', () => {
      expect(parent.child).toBeInstanceOf(ChildInteractor);
      expect(parent.child.deep()).toBeInstanceOf(DeepInteractor);
    });

    it('returns a new parent instance from nested methods', () => {
      expect(parent.child.test1()).toBeInstanceOf(ParentInteractor);
      expect(parent.child.test2()).toBeInstanceOf(ParentInteractor);
      expect(parent.child.deep().test()).toBeInstanceOf(ParentInteractor);
      expect(parent.child.test4()).toBeInstanceOf(ParentInteractor);
    });

    it('appends child interactions to the parent instance queue', () => {
      let test = parent.child.test1().child.test2().child.deep().test();
      expect(test).toHaveProperty('_queue');
      expect(test._queue).toHaveLength(4);
    });

    it('does not return a new parent when a new child is not returned', () => {
      expect(parent.child.test3()).not.toBeInstanceOf(ChildInteractor);
      expect(parent.child.test3()).not.toBeInstanceOf(ParentInteractor);
    });
  });

  describe('from an object', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = Interactor.from({
        static: {
          name: 'TestInteractor',
          defaultScope: '.test'
        },

        foo: 'bar',

        get getter() {
          return 'got';
        },

        func() {},

        descr: {
          enumerable: false,
          configurable: false,
          value: () => {}
        },

        nested: new Interactor(),
        action: new Interactor().do(() => {})
      });
    });

    it('uses properties from the `static` key for static members', () => {
      expect(TestInteractor.name).toEqual('TestInteractor');
      expect(TestInteractor.defaultScope).toEqual('.test');
    });

    it('creates an interactor class with the provided properties', () => {
      expect(TestInteractor.prototype).toHaveProperty('foo', 'bar');
      expect(TestInteractor.prototype).toHaveProperty('getter', 'got');
      expect(TestInteractor.prototype).toHaveProperty('func', expect.any(Function));
    });

    it('creates an interactor class using property descriptors', () => {
      expect(TestInteractor.prototype).toHaveProperty('descr', expect.any(Function));
    });

    it('creates an interactor class with nested interactors', () => {
      expect(TestInteractor.prototype).toHaveProperty('nested', expect.any(Interactor));
    });

    it('creates an interactor class with interactor actions', () => {
      expect(TestInteractor.prototype).toHaveProperty('action', expect.any(Function));
    });

    it('creates an interactor class from the origin class', () => {
      let ExtendedInteractor = TestInteractor.from({ bar: 'baz' });
      expect(ExtendedInteractor.prototype).toHaveProperty('bar', 'baz');
      expect(ExtendedInteractor.prototype).toBeInstanceOf(TestInteractor);
    });

    describe('with reserved property names', () => {
      let reserved = [
        'when',
        'always',
        'do',
        'timeout',
        'run',
        'then',
        'append',
        'only'
      ];

      for (let name of reserved) {
        it(`throws an error for \`${name}\``, () => {
          expect(() => Interactor.from({ [name]: '' }))
            .toThrow(`"${name}" is a reserved property name`);
        });
      }
    });
  });

  describe('using the extend decorator', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = @Interactor.extend class TestInteractor {
        static defaultScope = '.test';

        foo = 'bar';

        get getter() {
          return 'got';
        }

        func() {}

        test = {
          enumerable: false,
          configurable: false,
          value: () => {}
        }

        nested = new Interactor();
        action = new Interactor().do(() => {});
      };
    });

    it('uses properties from the `static` key for static members', () => {
      expect(TestInteractor.name).toEqual('TestInteractor');
      expect(TestInteractor.defaultScope).toEqual('.test');
    });

    it('extends the interactor class with the provided properties', () => {
      expect(TestInteractor.prototype).toHaveProperty('foo', 'bar');
      expect(TestInteractor.prototype).toHaveProperty('getter', 'got');
    });

    it('extends the interactor class using property descriptors', () => {
      expect(TestInteractor.prototype).toHaveProperty('test', expect.any(Function));
    });

    it('extends the interactor class with nested interactors', () => {
      expect(TestInteractor.prototype).toHaveProperty('nested', expect.any(Interactor));
    });

    it('extends the interactor class with interactor actions', () => {
      expect(TestInteractor.prototype).toHaveProperty('action', expect.any(Function));
    });

    it('extends the interactor class from the origin class', () => {
      let ExtendedInteractor = @TestInteractor.extend class { bar = 'baz' };
      expect(ExtendedInteractor.prototype).toHaveProperty('bar', 'baz');
      expect(ExtendedInteractor.prototype).toBeInstanceOf(TestInteractor);
    });

    describe('with reserved property names', () => {
      let reserved = [
        'when',
        'always',
        'do',
        'timeout',
        'run',
        'then',
        'append',
        'only'
      ];

      for (let name of reserved) {
        it(`throws an error for \`${name}\``, () => {
          expect(() => @Interactor.extend class { [name] = '' })
            .toThrow(`"${name}" is a reserved property name`);
        });
      }
    });

    describe('with a plain object', () => {
      let TestInteractor;

      beforeEach(() => {
        let stub = (...args) => {
          (stub.calls = (stub.calls || [])).push(args);
        };

        stub.og = console.warn;
        console.warn = stub;

        TestInteractor = Interactor.extend({});
      });

      afterEach(() => {
        console.warn = console.warn.og;
      });

      it('creates an interactor class', () => {
        expect(TestInteractor.prototype).toBeInstanceOf(Interactor);
      });

      it('raises a deprication warning', () => {
        expect(console.warn.calls).toHaveLength(1);
        expect(console.warn.calls[0][0]).toMatch('Deprecated');
      });
    });
  });
});
