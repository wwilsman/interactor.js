import expect from 'expect';

import { Convergence } from 'interactor.js';
import { get } from '../../src/utils/meta';

describe('Convergence', () => {
  describe('creating a new instance', () => {
    it('has a default timeout of 2000ms', () => {
      expect(new Convergence().timeout()).toBe(2000);
    });

    it('allows initializing with a different timeout', () => {
      expect(new Convergence(50).timeout()).toBe(50);
    });

    it('is thennable', async () => {
      let converge = new Convergence();
      expect(converge).toHaveProperty('then', expect.any(Function));

      let value = await converge.do(() => 'hello');
      expect(value).toBe('hello');

      await expect(converge.do(() => {
        throw new Error('catch me');
      })).rejects.toThrow('catch me');
    });
  });

  describe('extending convergences', () => {
    let custom;

    class CustomConvergence extends Convergence {
      constructor(options = {}, prev = {}) {
        super(options, prev);

        Object.defineProperty(this, 'test', {
          value: options.test || prev.test
        });
      }

      setTest(test) {
        return new this.constructor({ test }, this);
      }
    }

    beforeEach(() => {
      custom = new CustomConvergence({ test: 'a' });
    });

    it('returns the custom instance', () => {
      expect(custom).toBeInstanceOf(CustomConvergence);
      expect(custom).toBeInstanceOf(Convergence);
      expect(custom).toHaveProperty('test', 'a');
    });

    it('has custom immutable methods', () => {
      let next = custom.setTest('b');

      expect(next).toBeInstanceOf(CustomConvergence);
      expect(next).not.toBe(custom);
      expect(next.test).toBe('b');
      expect(custom.test).toBe('a');
    });

    it('existing methods return a custom instance', () => {
      let next = custom.timeout(100);

      expect(next).toBeInstanceOf(CustomConvergence);
      expect(next).not.toBe(custom);
      expect(next.test).toBe(custom.test);
    });

    it('preserves properties across instances', () => {
      let next = custom.timeout(100);

      expect(next.timeout()).toBe(100);
      expect(next).toHaveProperty('test', 'a');

      next = next.setTest('c');
      expect(next.timeout()).toBe(100);
      expect(next.test).toBe('c');
    });
  });

  describe('with an existing instance', () => {
    let converge;

    beforeEach(() => {
      converge = new Convergence();
    });

    describe('setting a new timeout', () => {
      let quick;

      beforeEach(() => {
        quick = converge.timeout(50);
      });

      it('creates a new instance', () => {
        expect(quick).toBeInstanceOf(Convergence);
        expect(quick).not.toBe(converge);
      });

      it('has a new timeout', () => {
        expect(quick.timeout()).toBe(50);
        expect(converge.timeout()).toBe(2000);
      });
    });

    describe('adding assertions with `.when()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.when(() => {});
      });

      it('creates a new instance', () => {
        expect(assertion).toBeInstanceOf(Convergence);
        expect(assertion).not.toBe(converge);
      });

      it('creates a new queue', () => {
        expect(get(assertion, 'queue')).not.toBe(get(converge, 'queue'));
        expect(get(assertion, 'queue')).toHaveLength(1);
        expect(get(converge, 'queue')).toHaveLength(0);
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
        assertion = converge.always(() => {});
      });

      it('creates a new instance', () => {
        expect(assertion).toBeInstanceOf(Convergence);
        expect(assertion).not.toBe(converge);
      });

      it('creates a new queue', () => {
        expect(get(assertion, 'queue')).not.toBe(get(converge, 'queue'));
        expect(get(assertion, 'queue')).toHaveLength(1);
        expect(get(converge, 'queue')).toHaveLength(0);
      });

      it('adds to a new queue with an `always` flag and own timeout', () => {
        let assert = () => {};

        assertion = assertion.always(assert, 200);
        expect(get(assertion, 'queue')[1]).toHaveProperty('assertion', assert);
        expect(get(assertion, 'queue')[1]).toHaveProperty('always', true);
        expect(get(assertion, 'queue')[1]).toHaveProperty('timeout', 200);
      });
    });

    describe('adding callbacks with `.do()`', () => {
      let callback;

      beforeEach(() => {
        callback = converge.do(() => {});
      });

      it('creates a new instance', () => {
        expect(callback).toBeInstanceOf(Convergence);
        expect(callback).not.toBe(converge);
      });

      it('creates a new queue', () => {
        expect(get(callback, 'queue')).not.toBe(get(converge, 'queue'));
        expect(get(callback, 'queue')).toHaveLength(1);
        expect(get(converge, 'queue')).toHaveLength(0);
      });

      it('adds to a new queue with a `callback` property', () => {
        let fn = () => {};

        callback = callback.do(fn);
        expect(get(callback, 'queue')[1]).toHaveProperty('callback', fn);
      });
    });

    describe('combining convergences with `.append()`', () => {
      let combined;

      beforeEach(() => {
        combined = converge.append(
          new Convergence().when(() => {})
        );
      });

      it('creates a new instance', () => {
        expect(combined).toBeInstanceOf(Convergence);
        expect(combined).not.toBe(converge);
      });

      it('creates a new queue', () => {
        expect(get(combined, 'queue')).not.toBe(get(converge, 'queue'));
        expect(get(combined, 'queue')).toHaveLength(1);
        expect(get(converge, 'queue')).toHaveLength(0);
      });

      it('combines the two queues', () => {
        let fn = () => {};

        combined = combined.append(
          new Convergence().do(fn)
        );

        expect(get(combined, 'queue')[1]).toHaveProperty('callback', fn);
      });

      it('throws when not a convergence instance', () => {
        expect(() => converge.append({}))
          .toThrow('.append() only works with convergence instances');
      });
    });
  });

  describe('running convergences', () => {
    let total, converge, timeouts;
    let createTimeout = (...args) => {
      timeouts.push(setTimeout(...args));
    };

    beforeEach(() => {
      total = 0;
      converge = new Convergence(100);
      timeouts = [];
    });

    afterEach(() => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
    });

    it('returns a promise', () => {
      expect(converge.run()).toBeInstanceOf(Promise);
    });

    it('should be fulfilled when there are no assertions', () => {
      return expect(converge.run()).resolves.toBeDefined();
    });

    describe('after using `.when()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.when(() => expect(total).toBe(5));
      });

      it('resolves after assertions converge', async () => {
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
        assertion = converge.when(function() {
          expect(this).toBe(assertion);
        });

        return expect(assertion.run()).resolves.toBeDefined();
      });

      it('rejects with an error when using an async function', () => {
        expect(converge.when(async () => {}).run()).rejects.toThrow(/async/);
      });

      it('rejects with an error when returning a promise', () => {
        expect(converge.when(() => Promise.resolve()).run()).rejects.toThrow(/promise/);
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
        assertion = converge.always(() => {
          expect(total).toBe(5);
        });
      });

      it('retains the instance context', () => {
        assertion = converge.always(function() {
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
        expect(converge.always(async () => {}).run()).rejects.toThrow(/async/);
      });

      it('rejects with an error when returning a promise', () => {
        expect(converge.always(() => Promise.resolve()).run()).rejects.toThrow(/promise/);
      });

      describe('with a timeout', () => {
        beforeEach(() => {
          assertion = converge.always(() => {
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
        assertion = converge
          .when(() => expect(total).toBe(5))
          .do(() => total * 100);

        createTimeout(() => total = 5, 50);
        return expect(assertion.run()).resolves.toHaveProperty('value', 500);
      });

      it('passes the previous return value to the callback', () => {
        assertion = converge
          .when(() => {
            expect(total).toBe(5);
            return total * 100;
          })
          .do((n) => n / 20);

        createTimeout(() => total = 5, 50);
        return expect(assertion.run()).resolves.toHaveProperty('value', 25);
      });

      it('is not called when a previous assertion fails', async () => {
        let called = false;

        assertion = converge
          .when(() => expect(total).toBe(5))
          .do(() => called = true);

        await expect(assertion.run()).rejects.toThrow();
        expect(called).toBe(false);
      });

      it('retains the instance context', () => {
        assertion = converge.do(function() {
          expect(this).toBe(assertion);
        });

        return expect(assertion.run()).resolves.toBeDefined();
      });

      describe('and returning a convergence', () => {
        beforeEach(() => {
          // converge reference can be modified before running
          assertion = converge.do(() => converge);
        });

        it('waits for the convergence to settle', async () => {
          let start = Date.now();
          let done = false;

          converge = converge.when(() => done === true);
          createTimeout(() => done = true, 50);

          await expect(assertion.run()).resolves.toBeDefined();

          let elapsed = Date.now() - start;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThan(100);
        });

        it('rejects when the convergence does', async () => {
          let start = Date.now();
          let called = false;

          converge = converge.when(() => false);
          assertion = assertion.do(() => called = true);

          await expect(assertion.timeout(50).run()).rejects.toThrow();
          expect(Date.now() - start).toBeGreaterThanOrEqual(50);
          expect(called).toBe(false);
        });

        it('gives the final `.always()` the remaining timeout', async () => {
          let start = Date.now();

          converge = converge.always(() => true, 200);
          await expect(assertion.timeout(50).run()).resolves.toBeDefined();

          let elapsed = Date.now() - start;
          expect(elapsed).toBeGreaterThanOrEqual(50);
          expect(elapsed).toBeLessThan(100);
        });

        it('curries the resolved value to the next function', () => {
          converge = converge.do(() => 1);
          assertion = assertion.when((val) => expect(val).toBe(1));

          return expect(assertion.run()).resolves
            .toMatchObject({
              queue: expect.arrayContaining([
                expect.objectContaining({ value: 1 })
              ])
            });
        });

        it('rejects after the exceeding the timeout', () => {
          converge = converge.do(() => {
            return new Promise((resolve) => {
              createTimeout(resolve, 50);
            });
          });

          return expect(assertion.timeout(50).run()).rejects
            .toThrow('convergence exceeded the 50ms timeout');
        });
      });

      describe('and returning a promise', () => {
        let resolve, reject;

        beforeEach(() => {
          assertion = converge.do(() => {
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

        it('curries the resolved value to the next function', () => {
          assertion = assertion
            .when((val) => expect(val).toBe(1));

          createTimeout(() => resolve(1), 10);
          return expect(assertion.run()).resolves
            .toMatchObject({
              queue: expect.arrayContaining([
                expect.objectContaining({ value: 1 })
              ])
            });
        });

        it('rejects after the exceeding the timeout', () => {
          createTimeout(() => resolve(), 60);
          return expect(assertion.timeout(50).run()).rejects
            .toThrow('convergence exceeded the 50ms timeout');
        });
      });
    });

    describe('after using `.append()`', () => {
      it('runs methods from the other convergence', async () => {
        let called = false;

        let assertion = converge.when(() => expect(total).toBe(5));
        assertion = assertion.append(converge.do(() => called = true));

        createTimeout(() => total = 5, 50);
        await expect(assertion.run()).resolves.toBeDefined();
        expect(called).toBe(true);
      });
    });

    describe('after using various chain methods', () => {
      it('resolves with a combined stats object', async () => {
        let assertion = converge
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

        let assertion = converge
          .do(() => arr.push('first'))
          .do(() => arr.push('second'));

        await expect(assertion.run()).resolves.toBeDefined();
        expect(arr).toEqual(['first', 'second']);
      });

      it('curries previous return values through the stack', async () => {
        await converge
          .when(() => true)
          .do(foo => !foo)
          .always(foo => foo.toString())
        // undefined returns curry the value
          .when(foo => {
            expect(foo).toBe('false');
          })
          .do(foo => {
            expect(foo).toBe('false');
          })
          .always(foo => {
            expect(foo).toBe('false');
            return null;
          })
          .do(foo => {
            expect(foo).toBe(null);
          });
      });
    });
  });
});
