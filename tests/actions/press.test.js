import { assert, fixture, listen } from 'tests/helpers';
import Interactor, { press } from 'interactor.js';

describe('Actions: press', () => {
  beforeEach(() => {
    fixture(`
      <input class="input"/>
      <textarea class="textarea"></textarea>
      <div class="contenteditable" contenteditable></div>
      <div class="just-a-div"></div>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(press('.input', 'f'), Interactor);
  });

  it('fires keydown and keyup events on the element', async () => {
    let dEvent = listen('.input', 'keydown');
    let uEvent = listen('.input', 'keyup');

    await press('.input', 'f');

    assert.equal(dEvent.count, 1);
    assert.equal(uEvent.count, 1);
  });

  it('can be called with an interactor selector', async () => {
    let Test = Interactor.extend({
      foo: () => press('', 'f')
    });

    let action = press(Test('.input'), 'a');
    let event = listen('.input', 'keyup');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.foo();

    assert.equal(event.count, 2);
    assert.equal(event.$el.value, 'af');
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.input', 'keyup');
      let Test = Interactor.extend({
        interactor: { selector: '.input' }
      });

      assert.typeOf(Interactor('.input').press, 'function');
      assert.instanceOf(Interactor('.input').press('a'), Interactor);

      assert.typeOf(Test().press, 'function');
      assert.instanceOf(Test().press('b'), Test);

      await Interactor('.input').press('a');
      await Test().press('b');

      assert.equal(event.count, 2);
      assert.equal(event.$el.value, 'ab');
    });

    it('can be called on nested interactors', async () => {
      let kdEvent = listen('.input', 'keydown');
      let kuEvent = listen('.input', 'keyup');
      let Test = Interactor.extend({
        input: Interactor('.input')
      });

      await Test()
        .input.press('KeyA')
        .input.keydown('Shift')
        .input.press('KeyA');

      assert.equal(kdEvent.count, 3);
      assert.equal(kuEvent.count, 2);
      assert.equal(kuEvent.$el.value, 'aA');
    });

    it('can be overridden', async () => {
      let event = listen('.input', 'keyup');
      let called = false;

      let Test = Interactor.extend({
        interactor: { selector: '.input' },
        press: () => (called = true)
      });

      assert.typeOf(Test().press, 'function');
      await Test().press('t');

      assert.equal(event.count, 0);
      assert.equal(event.$el.value, '');
      assert.equal(called, true);
    });
  });
});
