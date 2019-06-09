import expect from 'expect';

import { $, injectHtml } from '../helpers';
import interactor, { Interactor } from 'interactor.js';
import { get } from '../../src/utils/meta';

describe('Interactor', () => {
  let instance;

  beforeEach(() => {
    instance = new Interactor();
  });

  it('creates a new instance', () => {
    expect(instance).toBeInstanceOf(Interactor);
  });

  it('has a default timeout of 2000ms', () => {
    expect(instance.timeout()).toBe(2000);
  });

  it('can be created with a custom timeout', () => {
    expect(new Interactor(50).timeout()).toBe(50);
  });

  it('is thennable', async () => {
    expect(instance).toHaveProperty('then', expect.any(Function));

    let test = false;
    await instance.do(() => test = true);
    expect(test).toBe(true);

    await expect(instance.do(() => {
      throw new Error('catch me');
    })).rejects.toThrow('catch me');
  });

  describe('setting a new timeout', () => {
    let quick;

    beforeEach(() => {
      quick = instance.timeout(50);
    });

    it('creates a new instance', () => {
      expect(quick).toBeInstanceOf(Interactor);
      expect(quick).not.toBe(instance);
    });

    it('has a new timeout', () => {
      expect(quick.timeout()).toBe(50);
      expect(instance.timeout()).toBe(2000);
    });
  });

  describe('adding assertions with `.when()`', () => {
    let assertion;

    beforeEach(() => {
      assertion = instance.when(() => {});
    });

    it('creates a new instance', () => {
      expect(assertion).toBeInstanceOf(Interactor);
      expect(assertion).not.toBe(instance);
    });

    it('creates a new queue', () => {
      expect(get(assertion, 'queue')).not.toBe(get(instance, 'queue'));
      expect(get(assertion, 'queue')).toHaveLength(1);
      expect(get(instance, 'queue')).toHaveLength(0);
    });

    it('adds the assertion to the new queue', () => {
      let assert = () => {};
      assertion = assertion.when(assert);
      expect(get(assertion, 'queue')[1]).toHaveProperty('assertion', assert);
    });
  });

  describe('adding assertions with `.always()`', () => {
    let assertion;

    beforeEach(() => {
      assertion = instance.always(() => {});
    });

    it('creates a new instance', () => {
      expect(assertion).toBeInstanceOf(Interactor);
      expect(assertion).not.toBe(instance);
    });

    it('creates a new queue', () => {
      expect(get(assertion, 'queue')).not.toBe(get(instance, 'queue'));
      expect(get(assertion, 'queue')).toHaveLength(1);
      expect(get(instance, 'queue')).toHaveLength(0);
    });

    it('adds to a new queue with an `always` flag and own timeout', () => {
      let assert = () => {};
      assertion = assertion.always(assert, 200);
      expect(get(assertion, 'queue')[1]).toEqual({
        assertion: assert,
        always: true,
        timeout: 200
      });
    });
  });

  describe('adding callbacks with `.do()`', () => {
    let callback;

    beforeEach(() => {
      callback = instance.do(() => {});
    });

    it('creates a new instance', () => {
      expect(callback).toBeInstanceOf(Interactor);
      expect(callback).not.toBe(instance);
    });

    it('creates a new queue', () => {
      expect(get(callback, 'queue')).not.toBe(get(instance, 'queue'));
      expect(get(callback, 'queue')).toHaveLength(1);
      expect(get(instance, 'queue')).toHaveLength(0);
    });

    it('adds to a new queue with a `callback` property', () => {
      let fn = () => {};
      callback = callback.do(fn);
      expect(get(callback, 'queue')[1]).toHaveProperty('callback', fn);
    });
  });

  describe('combining interactors with `.append()`', () => {
    let combined;

    beforeEach(() => {
      combined = instance.append(
        new Interactor().when(() => {})
      );
    });

    it('creates a new instance', () => {
      expect(combined).toBeInstanceOf(Interactor);
      expect(combined).not.toBe(instance);
    });

    it('creates a new queue', () => {
      expect(get(combined, 'queue')).not.toBe(get(instance, 'queue'));
      expect(get(combined, 'queue')).toHaveLength(1);
      expect(get(instance, 'queue')).toHaveLength(0);
    });

    it('combines the two queues', () => {
      let fn = () => {};
      combined = combined.append(new Interactor().do(fn));
      expect(get(combined, 'queue')[1]).toHaveProperty('callback', fn);
    });

    it('throws when not an interactor instance', () => {
      expect(() => instance.append({}))
        .toThrow('expected an interactor instance, instead recieved "[object Object]"');
    });
  });

  describe('running interactors', () => {
    let timeouts, total;
    let createTimeout = (...args) => {
      timeouts.push(setTimeout(...args));
    };

    beforeEach(() => {
      instance = new Interactor(100);
      timeouts = [];
      total = 0;
    });

    afterEach(() => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
    });

    it('returns a promise', () => {
      expect(instance.run()).toBeInstanceOf(Promise);
    });

    it('should resolve when there are no assertions', () => {
      return expect(instance.run()).resolves.toBeUndefined();
    });

    describe('after using `.when()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = instance.when(() => expect(total).toBe(5));
      });

      it('resolves after assertions are met', async () => {
        let start = Date.now();

        createTimeout(() => total = 5, 30);
        await expect(assertion.run()).resolves.toBeDefined();

        let elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(30);
        expect(elapsed).toBeLessThan(100);
      });

      it('rejects when an assertion is not met', () => {
        return expect(assertion.run()).rejects.toThrow();
      });

      it('retains the instance context', () => {
        assertion = instance.when(function() {
          expect(this).toBe(assertion);
        });

        return expect(assertion.run()).resolves.toBeDefined();
      });

      it('rejects with an error when using an async function', () => {
        expect(instance.when(async () => {}).run()).rejects.toThrow(/async/);
      });

      it('rejects with an error when returning a promise', () => {
        expect(instance.when(() => Promise.resolve()).run()).rejects.toThrow(/promise/);
      });

      describe('with additional chaining', () => {
        beforeEach(() => {
          assertion = assertion.when(() => expect(total).toBe(10));
        });

        it('resolves after at all assertions are met', async () => {
          let start = Date.now();

          createTimeout(() => total = 5, 30);
          createTimeout(() => total = 10, 50);
          await expect(assertion.run()).resolves.toBeDefined();

          let elapsed = Date.now() - start;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThan(100);
        });

        it('rejects if assertions are not met in order', () => {
          createTimeout(() => total = 10, 30);
          createTimeout(() => total = 5, 50);
          return expect(assertion.run()).rejects.toThrow();
        });
      });
    });

    describe('after using `.always()`', () => {
      let assertion;

      beforeEach(() => {
        total = 5;
        assertion = instance.always(() => {
          expect(total).toBe(5);
        });
      });

      it('retains the instance context', () => {
        assertion = instance.always(function() {
          expect(this).toBe(assertion);
        });

        return expect(assertion.run()).resolves.toBeDefined();
      });

      it('resolves after the 100ms timeout', async () => {
        let start = Date.now();
        await expect(assertion.run()).resolves.toBeDefined();
        expect(Date.now() - start).toBeGreaterThanOrEqual(100);
      });

      it('rejects when the assertion fails', async () => {
        createTimeout(() => total = 10, 50);

        let start = Date.now();
        await expect(assertion.run()).rejects.toThrow();
        expect(Date.now() - start).toBeLessThan(100);
      });

      it('rejects with an error when using an async function', () => {
        expect(instance.always(async () => {}).run()).rejects.toThrow(/async/);
      });

      it('rejects with an error when returning a promise', () => {
        expect(instance.always(() => Promise.resolve()).run()).rejects.toThrow(/promise/);
      });

      describe('with a timeout', () => {
        beforeEach(() => {
          assertion = instance.always(() => {
            expect(total).toBe(5);
          }, 50);
        });

        it('resolves after the 50ms timeout', async () => {
          let start = Date.now();
          await expect(assertion.run()).resolves.toBeDefined();
          expect(Date.now() - start).toBeGreaterThanOrEqual(50);
        });

        it('rejects if the assertion fails within 50ms', async () => {
          createTimeout(() => total = 10, 30);

          let start = Date.now();
          await expect(assertion.run()).rejects.toThrow();
          expect(Date.now() - start).toBeLessThan(50);
        });
      });

      describe('with additional chaining', () => {
        beforeEach(() => {
          assertion = assertion.do(() => {});
        });

        it('resolves after one-tenth the total timeout', async () => {
          let start = Date.now();
          await expect(assertion.timeout(1000).run()).resolves.toBeDefined();
          expect(Date.now() - start).toBeGreaterThanOrEqual(100);
        });

        it('resolves after at minumum 20ms', async () => {
          let start = Date.now();
          await expect(assertion.run()).resolves.toBeDefined();
          expect(Date.now() - start).toBeGreaterThanOrEqual(20);
        });
      });
    });

    describe('after using `.do()`', () => {
      let assertion;

      it('triggers the callback before resolving', () => {
        assertion = instance
          .when(() => expect(total).toBe(5))
          .do(() => total * 100);

        createTimeout(() => total = 5, 50);
        return expect(assertion.run()).resolves.toHaveProperty('value', 500);
      });

      it('is not called when a previous assertion fails', async () => {
        let called = false;

        assertion = instance
          .when(() => expect(total).toBe(5))
          .do(() => called = true);

        await expect(assertion.run()).rejects.toThrow();
        expect(called).toBe(false);
      });

      it('retains the instance context', () => {
        assertion = instance.do(function() {
          expect(this).toBe(assertion);
        });

        return expect(assertion.run()).resolves.toBeDefined();
      });

      describe('and returning an interactor', () => {
        beforeEach(() => {
          // instance reference can be modified before running
          assertion = instance.do(() => instance);
        });

        it('waits for the interactor to settle', async () => {
          let start = Date.now();
          let done = false;

          instance = instance.when(() => done === true);
          createTimeout(() => done = true, 50);

          await expect(assertion.run()).resolves.toBeDefined();

          let elapsed = Date.now() - start;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThan(100);
        });

        it('rejects when the interactor does', async () => {
          let start = Date.now();
          let called = false;

          instance = instance.when(() => false);
          assertion = assertion.do(() => called = true);

          await expect(assertion.timeout(50).run()).rejects.toThrow();
          expect(Date.now() - start).toBeGreaterThanOrEqual(50);
          expect(called).toBe(false);
        });

        it('gives the final `.always()` the remaining timeout', async () => {
          let start = Date.now();

          instance = instance.always(() => true, 200);
          await expect(assertion.timeout(50).run()).resolves.toBeDefined();

          let elapsed = Date.now() - start;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThan(100);
        });

        it('does not give `.always()` the remaining timeout when it is not last', async () => {
          let start = Date.now();
          let called = false;

          instance = instance.always(() => true, 50);
          assertion = assertion.do(() => called = true);
          await expect(assertion.timeout(100).run()).resolves.toBeDefined();

          let elapsed = Date.now() - start;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThan(100);
          expect(called).toBe(true);
        });

        it('rejects after the exceeding the timeout', () => {
          instance = instance.do(() => {
            return new Promise((resolve) => {
              createTimeout(resolve, 50);
            });
          });

          return expect(assertion.timeout(50).run()).rejects
            .toThrow('interactor exceeded the 50ms timeout');
        });
      });

      describe('and returning a promise', () => {
        let resolve, reject;

        beforeEach(() => {
          assertion = instance.do(() => {
            // eslint-disable-next-line promise/param-names
            return new Promise((res, rej) => {
              [resolve, reject] = [res, rej];
            });
          });
        });

        it('waits for the promise to settle', async () => {
          let start = Date.now();

          createTimeout(() => resolve(), 50);
          await expect(assertion.run()).resolves.toBeDefined();

          let elapsed = Date.now() - start;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThan(100);
        });

        it('rejects when the promise does', async () => {
          let start = Date.now();

          createTimeout(() => reject(new Error()), 50);
          await expect(assertion.run()).rejects.toThrow();

          let elapsed = Date.now() - start;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThan(100);
        });

        it('rejects after the exceeding the timeout', () => {
          createTimeout(() => resolve(), 60);
          return expect(assertion.timeout(50).run()).rejects
            .toThrow('interactor exceeded the 50ms timeout');
        });
      });
    });

    describe('after using `.append()`', () => {
      it('runs methods from the other interactor', async () => {
        let called = false;

        let assertion = instance.when(() => expect(total).toBe(5));
        assertion = assertion.append(instance.do(() => called = true));

        createTimeout(() => total = 5, 50);
        await expect(assertion.run()).resolves.toBeDefined();
        expect(called).toBe(true);
      });
    });

    describe('after using various chain methods', () => {
      it('resolves with a combined stats object', async () => {
        let assertion = instance
          .when(() => expect(total).toBe(5))
          .do(() => total = 10)
          .always(() => expect(total).toBe(10))
          .do(() => total * 5);

        createTimeout(() => total = 5, 50);

        let start = Date.now();
        let stats = await assertion.run();
        let end = Date.now();

        expect(stats.start).toBeGreaterThanOrEqual(start);
        expect(stats.end).toBeGreaterThanOrEqual(end);
        expect(stats.elapsed).toBeGreaterThanOrEqual(70);
        expect(stats.elapsed).toBeLessThan(100);
        expect(stats.runs).toBeLessThanOrEqual(11);
        expect(stats.timeout).toBe(100);
        expect(stats.value).toBe(50);
        expect(stats.queue).toHaveLength(4);
      });

      it('stores and calls the callbacks first-in-first-out', async () => {
        let arr = [];

        let assertion = instance
          .do(() => arr.push('first'))
          .do(() => arr.push('second'));

        await expect(assertion.run()).resolves.toBeDefined();
        expect(arr).toEqual(['first', 'second']);
      });
    });
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

    it('can access the scoped element from instancent methods', async () => {
      let scoped = new Interactor('#scoped').timeout(50);
      let $scoped = $('#scoped');

      await expect(scoped.when($element => {
        expect($element).toBe($scoped);
      })).resolves.toBeUndefined();
      await expect(scoped.always($element => {
        expect($element).toBe($scoped);
      })).resolves.toBeUndefined();
      await expect(scoped.do($element => {
        expect($element).toBe($scoped);
      })).resolves.toBeUndefined();
    });

    it('eventually throws an error when the scoped element cannot be found', async () => {
      let scoped = new Interactor('#not-found').timeout(50);
      let now = Date.now();

      await expect(scoped.when($element => {
        expect($element).toBeDefined();
      })).rejects.toThrow('unable to find "#not-found"');

      expect(Date.now() - now).toBeGreaterThanOrEqual(50);
    });

    describe('finding elements within the scope', () => {
      it('can find a single DOM element within the scope', () => {
        expect(new Interactor().$('.test-p').innerText).toBe('A');
        expect(new Interactor('#scoped').$('.test-p').innerText).toBe('B');
      });

      it('returns the root element when no selector is given', () => {
        expect(new Interactor('.test-p').$().innerText).toBe('A');
      });

      it('throws when finding a single element that does not exist', () => {
        expect(() => new Interactor().$('.non-existent'))
          .toThrow('unable to find ".non-existent"');
      });

      it('can find multiple DOM elements within the scope', () => {
        expect(new Interactor().$$('.test-p')).toHaveLength(2);
        expect(new Interactor('.test-p').$$()).toHaveLength(0);
      });

      it('throws when finding elements with an invalid selector', () => {
        expect(() => new Interactor().$('.#invalid')).toThrow('not a valid selector');
        expect(() => new Interactor().$$('.#invalid')).toThrow('not a valid selector');
      });

      it('returns element nodes given element nodes', () => {
        let $el = $('.test-p');
        expect(new Interactor().$($el)).toBe($el);
        expect(new Interactor().$$([$el])).toHaveLength(1);
      });
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
        TestInteractor = @interactor class TestInteractor {
          nested = new Interactor({
            scope: '.test-p',
            detached: true
          });

          scoped = new Interactor('.test-p');

          action = new Interactor('.test-p')
            .do(function() {
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
      expect(get(test, 'queue')).toHaveLength(4);
    });

    it('does not return a new parent when a new child is not returned', () => {
      expect(parent.child.test3()).not.toBeInstanceOf(ChildInteractor);
      expect(parent.child.test3()).not.toBeInstanceOf(ParentInteractor);
    });
  });

  describe('the static scoped method', () => {
    beforeEach(() => {
      injectHtml(`
        <div class="test-div"></div>
      `);
    });

    it('creates a scoped interactor', () => {
      let scoped = Interactor.scoped('.test-div');
      expect(scoped).toBeInstanceOf(Interactor);
      expect(scoped.$element).toBe($('.test-div'));
    });

    it('creates a custom interactor', () => {
      let CustomInteractor = Interactor.from({});
      let scoped = CustomInteractor.scoped('.test-div');
      expect(scoped).toBeInstanceOf(CustomInteractor);
      expect(scoped).toBeInstanceOf(Interactor);
      expect(scoped.$element).toBe($('.test-div'));
    });

    it('is bound to the respective class', () => {
      let CustomInteractor = Interactor.from({});
      let custom = CustomInteractor.scoped;
      let scoped = custom('.test-div');
      expect(scoped).toBeInstanceOf(CustomInteractor);
      expect(scoped).toBeInstanceOf(Interactor);
      expect(scoped.$element).toBe($('.test-div'));
    });
  });

  describe('from an object', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = Interactor.from({
        static: {
          name: 'TestInteractor',
          defaultScope: '.test',
          test: 'hello world',
          get get() { return this.test; },
          fn() {}
        },

        foo: 'bar',
        undef: undefined,
        nil: null,

        get getter() {
          return this.getgot;
        },

        func() {},

        descr: {
          enumerable: false,
          configurable: false,
          value: () => {}
        },

        getgot: {
          enumerable: false,
          configurable: false,
          get: () => 'got'
        },

        nested: new Interactor(),
        action: new Interactor().do(() => {})
      });
    });

    it('uses properties from the `static` key for static members', () => {
      expect(TestInteractor.name).toEqual('TestInteractor');
      expect(TestInteractor.defaultScope).toEqual('.test');
      expect(TestInteractor.test).toEqual('hello world');
      expect(TestInteractor.get).toEqual('hello world');
      expect(TestInteractor.fn).toEqual(expect.any(Function));
    });

    it('creates an interactor class with the provided properties', () => {
      expect(TestInteractor.prototype).toHaveProperty('foo', 'bar');
      expect(TestInteractor.prototype).toHaveProperty('undef', undefined);
      expect(TestInteractor.prototype).toHaveProperty('nil', null);
      expect(TestInteractor.prototype).toHaveProperty('getter', 'got');
      expect(TestInteractor.prototype).toHaveProperty('func', expect.any(Function));
    });

    it('creates an interactor class using property descriptors', () => {
      expect(TestInteractor.prototype).toHaveProperty('descr', expect.any(Function));
      expect(TestInteractor.prototype).toHaveProperty('getgot', 'got');
    });

    it('creates an interactor class with nested interactors', () => {
      expect(TestInteractor.prototype).toHaveProperty('nested', expect.any(Interactor));
    });

    it('creates an interactor class with interactor actions', () => {
      expect(TestInteractor.prototype).toHaveProperty('action', expect.any(Function));
    });

    it('creates an interactor class from the origin class', () => {
      let ExtendedInteractor = TestInteractor.from({
        bar: { enumerable: false, configurable: false, get: () => 'baz' }
      });

      expect(new ExtendedInteractor()).toHaveProperty('bar', 'baz');
      expect(new ExtendedInteractor()).toBeInstanceOf(TestInteractor);
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
        '$',
        '$$',
        '$dom',
        '$element',
        'only',
        'assert'
      ];

      for (let name of reserved) {
        it(`throws an error for \`${name}\``, () => {
          expect(() => Interactor.from({ [name]: '' }))
            .toThrow(`"${name}" is a reserved property name`);
        });
      }
    });
  });

  describe('using the decorator', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = @interactor class TestInteractor {
        static defaultScope = '.test';
        static test = 'hello world';
        static get get() { return this.test; }
        static fn() {}

        foo = 'bar';
        undef = undefined;
        nil = null;

        get getter() {
          return this.getgot;
        }

        func() {}

        test = {
          enumerable: false,
          configurable: false,
          value: () => {}
        }

        getgot = {
          enumerable: false,
          configurable: false,
          get: () => 'got'
        }

        nested = new Interactor();
        action = new Interactor().do(() => {});
      };
    });

    it('uses properties from the `static` key for static members', () => {
      expect(TestInteractor.name).toEqual('TestInteractor');
      expect(TestInteractor.defaultScope).toEqual('.test');
      expect(TestInteractor.test).toEqual('hello world');
      expect(TestInteractor.get).toEqual('hello world');
      expect(TestInteractor.fn).toEqual(expect.any(Function));
    });

    it('extends the interactor class with the provided properties', () => {
      expect(TestInteractor.prototype).toHaveProperty('foo', 'bar');
      expect(TestInteractor.prototype).toHaveProperty('undef', undefined);
      expect(TestInteractor.prototype).toHaveProperty('nil', null);
      expect(TestInteractor.prototype).toHaveProperty('getter', 'got');
      expect(TestInteractor.prototype).toHaveProperty('func', expect.any(Function));
    });

    it('extends the interactor class using property descriptors', () => {
      expect(TestInteractor.prototype).toHaveProperty('test', expect.any(Function));
      expect(TestInteractor.prototype).toHaveProperty('getgot', 'got');
    });

    it('extends the interactor class with nested interactors', () => {
      expect(TestInteractor.prototype).toHaveProperty('nested', expect.any(Interactor));
    });

    it('extends the interactor class with interactor actions', () => {
      expect(TestInteractor.prototype).toHaveProperty('action', expect.any(Function));
    });

    it('extends the interactor class from the origin class', () => {
      @interactor class ExtendedInteractor extends TestInteractor {
        bar = { enumerable: false, configurable: false, get: () => 'baz' };
      }

      expect(new ExtendedInteractor()).toHaveProperty('bar', 'baz');
      expect(new ExtendedInteractor()).toBeInstanceOf(TestInteractor);
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
        '$',
        '$$',
        '$dom',
        '$element',
        'only',
        'assert'
      ];

      for (let name of reserved) {
        it(`throws an error for \`${name}\``, () => {
          expect(() => @interactor class { [name] = '' })
            .toThrow(`"${name}" is a reserved property name`);
        });
      }
    });

    it('creates an interactor class using the legacy syntax', () => {
      let FnInteractor = interactor(() => {});
      expect(FnInteractor.prototype).toBeInstanceOf(Interactor);
    });

    it('throws an error for any other argument', () => {
      expect(() => interactor({})).toThrow('Invalid');
      expect(() => interactor([])).toThrow('Invalid');
      expect(() => interactor('string')).toThrow('Invalid');
      expect(() => interactor(42)).toThrow('Invalid');
      expect(() => interactor(true)).toThrow('Invalid');
    });
  });
});
