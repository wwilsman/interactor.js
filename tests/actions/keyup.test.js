import { assert, fixture, listen } from 'tests/helpers';
import Interactor, { keyup } from 'interactor.js';

describe('Actions: keyup', () => {
  beforeEach(() => {
    fixture(`
      <input class="input"/>
      <textarea class="textarea"></textarea>
      <div class="contenteditable" contenteditable></div>
      <div class="just-a-div"></div>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(keyup('.input', 'f'), Interactor);
  });

  it('fires a keyup event on the element', async () => {
    let event = listen('.input', 'keyup');
    await keyup('.input', 'f');
    assert.equal(event.count, 1);
  });

  it('can be called with an interactor selector', async () => {
    let Test = Interactor.extend({
      foo: () => keyup('', 'f')
    });

    let action = keyup(Test('.input'), 'a');
    let event = listen('.input', 'keyup');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.foo();

    assert.equal(event.count, 2);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.input', 'keyup');
      let Test = Interactor.extend({ selector: '.input' }, {});

      assert.typeOf(Interactor('.input').keyup, 'function');
      assert.instanceOf(Interactor('.input').keyup('a'), Interactor);

      assert.typeOf(Test().keyup, 'function');
      assert.instanceOf(Test().keyup('b'), Test);

      await Interactor('.input').keyup('a');
      await Test().keyup('b');

      assert.equal(event.count, 2);
    });

    it('un-persists nested keys throughout the interactor', async () => {
      let event = listen('.input', 'keyup');
      let Test = Interactor.extend({
        input: Interactor('.input')
      });

      await Test()
        .input.keydown('Shift')
        .input.keydown('KeyA')
        .input.keyup('Shift')
        .input.keydown('KeyA');

      assert.equal(event.count, 1);
      assert.equal(event.$el.value, 'Aa');
    });

    it('can be overridden', async () => {
      let event = listen('.input', 'keyup');
      let called = false;

      let Test = Interactor.extend({ selector: '.input' }, {
        keyup: () => (called = true)
      });

      assert.typeOf(Test().keyup, 'function');
      await Test().keyup('t');

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
