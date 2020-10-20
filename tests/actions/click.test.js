import { assert, e, fixture, listen } from 'tests/helpers';
import I from 'interactor.js';

describe('Actions: click', () => {
  beforeEach(() => {
    fixture(`
      <button class="btn-a"></button>
      <button class="btn-b" disabled></button>
      <div class="div"></div>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(I.click('.btn-a'), I);
  });

  it('fires a click event on the element', async () => {
    let bEvent = listen('.btn-a', 'click');
    let dEvent = listen('.div', 'click');

    await I.click('.btn-a');
    await I.click('.div');

    assert.equal(bEvent.count, 1);
    assert.equal(dEvent.count, 1);
  });

  it('throws an error when clicking a disabled element', async () => {
    let event = listen('.btn-b', 'click');

    await assert.rejects(
      I.click('.btn-b').timeout(50),
      e('InteractorError', '.btn-b is disabled')
    );

    assert.equal(event.count, 0);
  });

  it('can be called with an interactor selector', async () => {
    let Test = I.extend({
      foo: () => I.click()
    });

    let action = I.click(Test('.btn-a'));
    let event = listen('.btn-a', 'click');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.foo();

    assert.equal(event.count, 2);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.btn-a', 'click');
      let Test = I.extend({ selector: '.btn-a' }, {});

      assert.typeOf(I('.btn-a').click, 'function');
      assert.instanceOf(I('.btn-a').click(), I);

      assert.typeOf(Test().click, 'function');
      assert.instanceOf(Test().click(), Test);

      await I('.btn-a').click();
      await Test().click();

      assert.equal(event.count, 2);
    });

    it('can be overridden', async () => {
      let event = listen('.btn-a', 'click');
      let called = false;

      let Test = I.extend({ selector: '.btn-a' }, {
        click: () => (called = true)
      });

      assert.typeOf(Test().click, 'function');
      await Test().click();

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
