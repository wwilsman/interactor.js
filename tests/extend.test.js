import { assert, mockConsole } from 'tests/helpers';
import Interactor from 'interactor.js';

describe('Interactor.extend', () => {
  const mock = mockConsole();

  it('extends the parent instance', () => {
    let Test = Interactor.extend();
    assert.instanceOf(Test(), Test);
    assert.instanceOf(Test(), Interactor);

    let TestExtended = Test.extend();
    assert.instanceOf(TestExtended(), TestExtended);
    assert.instanceOf(TestExtended(), Test);
    assert.instanceOf(TestExtended(), Interactor);
  });

  it('augments static interactor options', () => {
    let Test = Interactor.extend({
      interactor: {
        name: 'bar',
        selector: 'foo',
        timeout: 1000,
        dom: () => 'dom'
      }
    });

    assert.equal(Test.name, 'bar');
    assert.equal(Test.selector, 'foo');
    assert.equal(Test.timeout, 1000);
    assert.equal(Test.dom, 'dom');

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

    assert.instanceOf(Test().assert(() => {}), Test);
    assert.equal(typeof Test().assert.passing, 'function');
    assert.equal(typeof Test().assert.failing, 'function');
    assert.equal(typeof Test().assert.something, 'function');
    assert.equal(typeof Test().assert.nested, 'function');
    assert.equal(typeof Test().assert.nested.passing, 'function');
    assert.equal(typeof Test().assert.nested.failing, 'function');
    assert.equal(typeof Test().assert.nested.something, 'undefined');
  });

  it('has properties that cannot be overridden', async () => {
    let Test = Interactor.extend({
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
      '`interactor` is a reserved property and will be ignored',
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
    let Deep = Interactor.extend();

    let Child = Interactor.extend({
      foo: Deep().exec(),
      bar: () => Deep().exec()
    });

    let Test = Interactor.extend({
      foo: Child().exec(),
      bar: () => Child().exec()
    });

    assert.instanceOf(Test().foo, Child);
    assert.instanceOf(Test().bar(), Test);
    assert.instanceOf(Test().foo.foo, Deep);
    assert.instanceOf(Test().foo.bar(), Test);
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
