import { assert, e, fixture, listen } from 'tests/helpers';
import Interactor, { uncheck } from 'interactor.js';

describe('Actions: uncheck', () => {
  beforeEach(() => {
    fixture(`
      <input type="checkbox" name="foo" class="check-a" checked/>
      <input type="checkbox" name="foo" class="check-b" disabled/>
      <input type="checkbox" name="foo" class="check-c"/>
      <input type="radio" name="bar" class="radio-a" checked/>
      <input type="radio" name="bar" class="radio-b"/>
      <input type="text" class="input"/>
      <div class="div"></div>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(uncheck('.check-a'), Interactor);
  });

  it('fires a click event on the element and marks it as not checked', async () => {
    let event = listen('.check-a', 'click');

    assert.equal(event.$el.checked, true);

    await uncheck('.check-a');

    assert.equal(event.count, 1);
    assert.equal(event.$el.checked, false);
  });

  it('throws an error when unchecking an element that is not checked', async () => {
    let event = listen('.check-c', 'click');

    await assert.rejects(
      uncheck('.check-c').timeout(50),
      e('InteractorError', '.check-c is not checked')
    );

    assert.equal(event.count, 0);
  });

  it('throws an error when checking a disabled element', async () => {
    let event = listen('.check-b', 'click');

    await assert.rejects(
      uncheck('.check-b').timeout(50),
      e('InteractorError', '.check-b is disabled')
    );

    assert.equal(event.count, 0);
  });

  it('throws an error when unchecking a elements that cannot be unchecked', async () => {
    let rEvent = listen('.radio-a', 'click');
    let iEvent = listen('.input', 'click');
    let dEvent = listen('.div', 'click');

    await assert.rejects(
      uncheck('.radio-a').timeout(50),
      e('InteractorError', '.radio-a is a radio button which cannot be unchecked')
    );

    await assert.rejects(
      uncheck('.input').timeout(50),
      e('InteractorError', '.input is not a checkbox')
    );

    await assert.rejects(
      uncheck('.div').timeout(50),
      e('InteractorError', '.div is not a checkbox')
    );

    assert.equal(rEvent.count, 0);
    assert.equal(iEvent.count, 0);
    assert.equal(dEvent.count, 0);
  });

  it('can be called with other interactor contexts', async () => {
    let Test = Interactor.extend({
      foo: () => uncheck()
    });

    let action = uncheck.call(Test('.check-a'));
    let event = listen('.check-a', 'click');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.click().foo();

    assert.equal(event.count, 3);
    assert.equal(event.$el.checked, false);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.check-a', 'click');
      let Test = Interactor.extend({
        interactor: { selector: '.check-a' }
      });

      assert.typeOf(Interactor('.check-a').uncheck, 'function');
      assert.instanceOf(Interactor('.check-a').uncheck(), Interactor);

      assert.typeOf(Test().uncheck, 'function');
      assert.instanceOf(Test().uncheck(), Test);

      await Interactor('.check-a').uncheck();
      await Test().click().uncheck();

      assert.equal(event.count, 3);
    });

    it('can be overridden', async () => {
      let event = listen('.check-a', 'click');
      let called = false;

      let Test = Interactor.extend({
        interactor: { selector: '.check-a' },
        uncheck: () => (called = true)
      });

      assert.typeOf(Test().uncheck, 'function');
      await Test().uncheck();

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
