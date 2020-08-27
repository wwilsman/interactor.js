import { assert, e, fixture, listen } from 'tests/helpers';
import Interactor, { check } from 'interactor.js';

describe('Actions: check', () => {
  beforeEach(() => {
    fixture(`
      <input type="checkbox" name="foo" class="check-a"/>
      <input type="checkbox" name="foo" class="check-b" checked/>
      <input type="checkbox" name="foo" class="check-c" disabled/>
      <input type="radio" name="bar" class="radio-a"/>
      <input type="radio" name="bar" class="radio-b"/>
      <input type="radio" name="bar" class="radio-c" checked/>
      <input type="text" class="input"/>
      <div class="div"></div>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(check('.check-a'), Interactor);
  });

  it('fires a click event on the element and marks it as checked', async () => {
    let cEvent = listen('.check-a', 'click');
    let rEvent = listen('.radio-a', 'click');
    let $radioC = document.querySelector('.radio-c');

    assert.equal(cEvent.$el.checked, false);
    assert.equal(rEvent.$el.checked, false);
    assert.equal($radioC.checked, true);

    await check('.check-a');
    await check('.radio-a');

    assert.equal(cEvent.count, 1);
    assert.equal(cEvent.$el.checked, true);
    assert.equal(rEvent.count, 1);
    assert.equal(rEvent.$el.checked, true);
    assert.equal($radioC.checked, false);
  });

  it('throws an error when checking an already checked element', async () => {
    let cEvent = listen('.check-b', 'click');
    let rEvent = listen('.radio-c', 'click');

    await assert.rejects(
      check('.check-b').timeout(50),
      e('InteractorError', '.check-b is checked')
    );

    await assert.rejects(
      check('.radio-c').timeout(50),
      e('InteractorError', '.radio-c is checked')
    );

    assert.equal(cEvent.count, 0);
    assert.equal(rEvent.count, 0);
  });

  it('throws an error when checking a disabled element', async () => {
    let event = listen('.check-c', 'click');

    await assert.rejects(
      check('.check-c').timeout(50),
      e('InteractorError', '.check-c is disabled')
    );

    assert.equal(event.count, 0);
  });

  it('throws an error when checking a non-checkable element', async () => {
    let iEvent = listen('.input', 'click');
    let dEvent = listen('.div', 'click');

    await assert.rejects(
      check('.input').timeout(50),
      e('InteractorError', '.input is not a checkbox or radio button')
    );

    await assert.rejects(
      check('.div').timeout(50),
      e('InteractorError', '.div is not a checkbox or radio button')
    );

    assert.equal(iEvent.count, 0);
    assert.equal(dEvent.count, 0);
  });

  it('can be called with an interactor selector', async () => {
    let Test = Interactor.extend({
      foo: () => check()
    });

    let action = check(Test('.check-a'));
    let event = listen('.check-a', 'click');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.click().foo();

    assert.equal(event.count, 3);
    assert.equal(event.$el.checked, true);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.radio-a', 'click');
      let Test = Interactor.extend({ selector: '.radio-a' }, {});

      assert.typeOf(Interactor('.radio-a').check, 'function');
      assert.instanceOf(Interactor('.radio-a').check(), Interactor);

      assert.typeOf(Test().check, 'function');
      assert.instanceOf(Test().check(), Test);

      await Interactor('.radio-a').check();
      await check('.radio-b');
      await Test().check();

      assert.equal(event.count, 2);
    });

    it('can be overridden', async () => {
      let event = listen('.check-a', 'click');
      let called = false;

      let Test = Interactor.extend({ selector: '.check-a' }, {
        check: () => (called = true)
      });

      assert.typeOf(Test().check, 'function');
      await Test().check();

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
