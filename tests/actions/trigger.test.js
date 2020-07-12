import { assert, fixture, listen } from 'tests/helpers';
import Interactor, { trigger } from 'interactor.js';

describe('Actions: trigger', () => {
  beforeEach(() => {
    fixture(`
      <div class="test"></div>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(trigger('.test', 'foo'), Interactor);
  });

  it('fires an arbitrary event on the element', async () => {
    let event = listen('.test', 'foo', e => (evt = e));
    let evt = null;

    await trigger('.test', 'foo', { bar: 'baz' });

    assert.equal(event.count, 1);
    assert.equal(evt.bar, 'baz');
  });

  it('can be called with an interactor selector', async () => {
    let Test = Interactor.extend({
      foo: () => trigger('', 'foo')
    });

    let action = trigger(Test('.test'), 'foo');
    let event = listen('.test', 'foo');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.foo();

    assert.equal(event.count, 2);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.test', 'foo');
      let Test = Interactor.extend({
        interactor: { selector: '.test' }
      });

      assert.typeOf(Interactor('.test').trigger, 'function');
      assert.instanceOf(Interactor('.test').trigger('foo'), Interactor);

      assert.typeOf(Test().trigger, 'function');
      assert.instanceOf(Test().trigger('foo'), Test);

      await Interactor('.test').trigger('foo');
      await Test().trigger('foo');

      assert.equal(event.count, 2);
    });

    it('can be overridden', async () => {
      let event = listen('.test', 'foo');
      let called = false;

      let Test = Interactor.extend({
        interactor: { selector: '.test' },
        trigger: () => (called = true)
      });

      assert.typeOf(Test().trigger, 'function');
      await Test().trigger('foo');

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
