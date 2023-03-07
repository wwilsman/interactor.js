import { assert, mockConsole } from './helpers.js';
import I from 'interactor.js';

describe('Interactor.extend', () => {
  const mock = mockConsole();

  it('extends the parent instance', () => {
    let Test = I.extend();
    assert.instanceOf(Test(), Test);
    assert.instanceOf(Test(), I);

    let TestExtended = Test.extend();
    assert.instanceOf(TestExtended(), TestExtended);
    assert.instanceOf(TestExtended(), Test);
    assert.instanceOf(TestExtended(), I);
  });

  it('can define static interactor options', () => {
    let Test = I.extend({
      name: 'bar',
      selector: 'foo',
      timeout: 1000,
      dom: () => 'dom',
      foobar: 'bazqux'
    }, {});

    assert.equal(Test.name, 'bar');
    assert.equal(Test.selector(), 'foo');
    assert.equal(Test.timeout, 1000);
    assert.equal(Test.dom, 'dom');
    assert.equal(Test.foobar, 'bazqux');

    assert.equal(Test().timeout(), 1000);
    assert.equal(Test().toString(), 'foo bar');
  });

  it('extends assert with custom assertion properties', () => {
    let Custom = I.extend({
      assert: {
        passing() {},
        failing() { throw Error('fail'); }
      },

      foo: {
        assert() {}
      }
    });

    let Test = Custom.extend({
      assert: { something() {} },
      nested: Custom(),
      custom: Custom
    });

    assert.instanceOf(Test().assert(() => {}), Test);
    assert.equal(typeof Test().assert.passing, 'function');
    assert.equal(typeof Test().assert.failing, 'function');
    assert.equal(typeof Test().assert.something, 'function');
    assert.equal(typeof Test().assert.foo, 'function');
    assert.equal(typeof Test().assert.nested, 'function');
    assert.equal(typeof Test().assert.nested.passing, 'function');
    assert.equal(typeof Test().assert.nested.failing, 'function');
    assert.equal(typeof Test().assert.nested.something, 'undefined');
    assert.equal(typeof Test().assert.nested.foo, 'function');
    assert.equal(typeof Test().assert.custom, 'function');
    assert.equal(typeof Test().assert.custom().passing, 'function');
    assert.equal(typeof Test().assert.custom().failing, 'function');
    assert.equal(typeof Test().assert.custom().something, 'undefined');
    assert.equal(typeof Test().assert.custom().foo, 'function');
  });

  it('has properties that cannot be overridden', async () => {
    let Test = I.extend({
      assert: {
        interactor() { throw new Error('interactor'); },
        assert() { throw new Error('assert'); },
        remains() { throw new Error('remains'); },
        not() { throw new Error('not'); }
      },

      $() { throw new Error('$'); },
      $$() { throw new Error('$$'); },
      exec() { throw new Error('exec'); },
      catch() { throw new Error('catch'); },
      then() { throw new Error('then'); }
    });

    assert.deepEqual(mock.warn.calls, [
      '`assert` is a reserved property and will be ignored',
      '`remains` is a reserved property and will be ignored',
      '`not` is a reserved property and will be ignored',
      '`$` is a reserved property and will be ignored',
      '`$$` is a reserved property and will be ignored',
      '`exec` is a reserved property and will be ignored',
      '`catch` is a reserved property and will be ignored',
      '`then` is a reserved property and will be ignored'
    ]);

    await assert.doesNotReject(
      Test()
        .assert.not(() => { throw new Error('assert not'); })
        .assert.remains(10)
        .exec()
        .then()
    );
  });

  it('wraps nested interactors to return the topmost instance', () => {
    let Deep = I.extend();

    let Child = I.extend({
      bar: Deep(),
      get baz() { return Deep(); },
      qux: Deep
    });

    let Test = I.extend({
      foo: Child(),
      get bar() { return Child(); },
      baz: Child
    });

    assert.instanceOf(Test().foo, Child);
    assert.instanceOf(Test().foo.exec(), Test);
    assert.instanceOf(Test().bar, Child);
    assert.instanceOf(Test().bar.exec(), Test);
    assert.instanceOf(Test().baz(), Child);
    assert.instanceOf(Test().baz().exec(), Test);
    assert.instanceOf(Test().foo.bar, Deep);
    assert.instanceOf(Test().foo.bar.exec(), Test);
    assert.instanceOf(Test().bar.baz, Deep);
    assert.instanceOf(Test().bar.baz.exec(), Test);
    assert.instanceOf(Test().baz().qux(), Deep);
    assert.instanceOf(Test().baz().qux().exec(), Test);
  });

  it('executes interactor action methods without returning the instance', () => {
    let Deep = I.extend();

    let Child = I.extend({
      foo: Deep().exec(),
      bar: () => Deep().exec()
    });

    let Test = I.extend({
      foo: Child().exec(),
      bar: () => Child().exec()
    });

    assert.instanceOf(Test().foo, Child);
    assert.instanceOf(Test().bar(), Test);
    assert.instanceOf(Test().foo.foo, Deep);
    assert.instanceOf(Test().foo.bar(), Test);
  });

  it('ignores property values that are not getters, methods, or valid descriptors', () => {
    let Test = I.extend({
      foo: () => 'bar',
      get bar() { return 'baz'; },
      baz: { get: () => 'qux' },
      qux: 'quux',
      quux: { foo: 'bar' }
    });

    assert.equal(Test().foo(), 'bar');
    assert.equal(Test().bar, 'baz');
    assert.equal(Test().baz, 'qux');
    assert.typeOf(Test().qux, 'undefined');
    assert.typeOf(Test().quux, 'undefined');
  });
});
