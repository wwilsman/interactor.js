import { assert, e, fixture, listen } from 'tests/helpers';
import Interactor, { blur } from 'interactor.js';

describe('Actions: blur', () => {
  beforeEach(() => {
    fixture(`
      <input class="input"/>
      <h1 class="heading" tabindex="0"></h1>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(blur('.input'), Interactor);
  });

  it('fires a blur event on the element', async () => {
    let iEvent = listen('.input', 'blur');
    let hEvent = listen('.heading', 'blur');

    iEvent.$el.focus();
    await blur('.input');

    hEvent.$el.focus();
    await blur('.heading');

    assert.equal(iEvent.count, 1);
    assert.equal(hEvent.count, 1);
  });

  it('throws an error when bluring a element without focus', async () => {
    let event = listen('.input', 'blur');

    await assert.rejects(
      blur('.input').timeout(50),
      e('InteractorError', '.input is not focused')
    );

    assert.equal(event.count, 0);
  });

  it('can be called with an interactor selector', async () => {
    let Test = Interactor.extend({
      foo: () => blur()
    });

    let action = blur(Test('.input'));
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
      let Test = Interactor.extend({
        interactor: { selector: '.heading' }
      });

      assert.typeOf(Interactor('.heading').blur, 'function');
      assert.instanceOf(Interactor('.heading').blur(), Interactor);

      assert.typeOf(Test().blur, 'function');
      assert.instanceOf(Test().blur(), Test);

      event.$el.focus();
      await Interactor('.heading').blur();

      event.$el.focus();
      await Test().blur();

      assert.equal(event.count, 2);
    });

    it('can be overridden', async () => {
      let event = listen('.heading', 'blur');
      let called = false;

      let Test = Interactor.extend({
        interactor: { selector: '.heading' },
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
