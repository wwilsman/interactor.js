import { assert, e, fixture, listen } from '../helpers.js';
import I from 'interactor.js';

describe('Actions: blur', () => {
  beforeEach(() => {
    fixture(`
      <input class="input"/>
      <h1 class="heading" tabindex="0"></h1>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(I.blur('.input'), I);
  });

  it('fires a blur event on the element', async () => {
    let iEvent = listen('.input', 'blur');
    let hEvent = listen('.heading', 'blur');

    iEvent.$el.focus();
    await I.blur('.input');

    hEvent.$el.focus();
    await I.blur('.heading');

    assert.equal(iEvent.count, 1);
    assert.equal(hEvent.count, 1);
  });

  it('throws an error when bluring a element without focus', async () => {
    let event = listen('.input', 'blur');

    await assert.rejects(
      I.blur('.input').timeout(50),
      e('InteractorError', '.input is not focused')
    );

    assert.equal(event.count, 0);
  });

  it('can be called with an interactor selector', async () => {
    let Test = I.extend({
      foo: () => I.blur()
    });

    let action = I.blur(Test('.input'));
    let event = listen('.input', 'blur');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    event.$el.focus();
    await action.focus().foo();

    assert.equal(event.count, 2);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.heading', 'blur');
      let Test = I.extend({ selector: '.heading' }, {});

      assert.typeOf(I('.heading').blur, 'function');
      assert.instanceOf(I('.heading').blur(), I);

      assert.typeOf(Test().blur, 'function');
      assert.instanceOf(Test().blur(), Test);

      event.$el.focus();
      await I('.heading').blur();

      event.$el.focus();
      await Test().blur();

      assert.equal(event.count, 2);
    });

    it('can be overridden', async () => {
      let event = listen('.heading', 'blur');
      let called = false;

      let Test = I.extend({ selector: '.heading' }, {
        blur: () => (called = true)
      });

      assert.typeOf(Test().blur, 'function');

      event.$el.focus();
      await Test().blur();

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
