import { assert } from './helpers';
import Interactor from 'interactor.js';

describe('Interactor.extend', () => {
  it('extends the parent instance', () => {
    let Test = Interactor.extend();
    assert(Test() instanceof Test);
    assert(Test() instanceof Interactor);

    let TestExtended = Test.extend();
    assert(TestExtended() instanceof TestExtended);
    assert(TestExtended() instanceof Test);
    assert(TestExtended() instanceof Interactor);
  });

  it('augments static interactor options', () => {
    let Test = Interactor.extend({
      interactor: {
        name: 'bar',
        selector: 'foo',
        timeout: 1000
      }
    });

    assert.equal(Test.name, 'bar');
    assert.equal(Test.selector, 'foo');
    assert.equal(Test.timeout, 1000);

    assert.equal(Test().timeout(), 1000);
    assert.equal(Test().toString(), 'foo bar');
  });

  it('extends assert with custom assertion properties', () => {
    let Custom = Interactor.extend({
      assert: {
        passing() {},
        failing() { throw Error('fail'); }
      }
    });

    let Test = Custom.extend({
      assert: { something() {} },
      nested: Custom()
    });

    assert(Test().assert(() => {}) instanceof Test);
    assert.equal(typeof Test().assert.passing, 'function');
    assert.equal(typeof Test().assert.failing, 'function');
    assert.equal(typeof Test().assert.something, 'function');
    assert.equal(typeof Test().assert.nested, 'function');
    assert.equal(typeof Test().assert.nested.passing, 'function');
    assert.equal(typeof Test().assert.nested.failing, 'function');
    assert.equal(typeof Test().assert.nested.something, 'undefined');
  });

  it('wraps nested interactors to return the topmost instance', () => {
    let Deep = Interactor.extend();

    let Child = Interactor.extend({
      bar: Deep(),
      get baz() { return Deep(); },
      qux: () => Deep()
    });

    let Test = Interactor.extend({
      foo: Child(),
      get bar() { return Child(); },
      baz: () => Child()
    });

    assert(Test().foo instanceof Child);
    assert(Test().foo.exec() instanceof Test);
    assert(Test().bar instanceof Child);
    assert(Test().bar.exec() instanceof Test);
    assert(Test().baz() instanceof Child);
    assert(Test().baz().exec() instanceof Test);
    assert(Test().foo.bar instanceof Deep);
    assert(Test().foo.bar.exec() instanceof Test);
    assert(Test().bar.baz instanceof Deep);
    assert(Test().bar.baz.exec() instanceof Test);
    assert(Test().baz().qux() instanceof Deep);
    assert(Test().baz().qux().exec() instanceof Test);
  });

  it('executes interactor action methods without returning the instance', () => {
    let Deep = Interactor.extend();

    let Child = Interactor.extend({
      foo: Deep().exec(),
      bar: () => Deep().exec()
    });

    let Test = Interactor.extend({
      foo: Child().exec(),
      bar: () => Child().exec()
    });

    assert(Test().foo instanceof Child);
    assert(Test().bar() instanceof Test);
    assert(Test().foo.foo instanceof Deep);
    assert(Test().foo.bar() instanceof Test);
  });

  it('allows non-interactor related properties', () => {
    let Test = Interactor.extend({
      foo: 'bar',
      get bar() { return 'baz'; },
      baz: () => 'qux'
    });

    assert.equal(Test().foo, 'bar');
    assert.equal(Test().bar, 'baz');
    assert.equal(Test().baz(), 'qux');
  });
});
