import { assert, fixture, listen } from '../helpers.js';
import I from 'interactor.js';

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
    assert.instanceOf(I.keyup('.input', 'f'), I);
  });

  it('fires a keyup event on the element', async () => {
    let event = listen('.input', 'keyup');
    await I.keyup('.input', 'f');
    assert.equal(event.count, 1);
  });

  it('can be called with an interactor selector', async () => {
    let Test = I.extend({
      foo: () => I.keyup('', 'f')
    });

    let action = I.keyup(Test('.input'), 'a');
    let event = listen('.input', 'keyup');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.foo();

    assert.equal(event.count, 2);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.input', 'keyup');
      let Test = I.extend({ selector: '.input' }, {});

      assert.typeOf(I('.input').keyup, 'function');
      assert.instanceOf(I('.input').keyup('a'), I);

      assert.typeOf(Test().keyup, 'function');
      assert.instanceOf(Test().keyup('b'), Test);

      await I('.input').keyup('a');
      await Test().keyup('b');

      assert.equal(event.count, 2);
    });

    it('un-persists nested keys throughout the interactor', async () => {
      let event = listen('.input', 'keyup');
      let Test = I.extend({
        input: I('.input')
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

      let Test = I.extend({ selector: '.input' }, {
        keyup: () => (called = true)
      });

      assert.typeOf(Test().keyup, 'function');
      await Test().keyup('t');

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
