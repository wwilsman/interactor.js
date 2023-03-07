import { assert, fixture, listen } from '../helpers.js';
import I from 'interactor.js';

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
    assert.instanceOf(I.press('.input', 'f'), I);
  });

  it('fires keydown and keyup events on the element', async () => {
    let dEvent = listen('.input', 'keydown');
    let uEvent = listen('.input', 'keyup');

    await I.press('.input', 'f');

    assert.equal(dEvent.count, 1);
    assert.equal(uEvent.count, 1);
  });

  it('can handle an array of keys to press sequentially', async () => {
    let dEvent = listen('.input', 'keydown');
    let uEvent = listen('.input', 'keyup');

    await I.press('.input', ['f', 'o', 'o']);

    assert.equal(dEvent.count, 3);
    assert.equal(uEvent.count, 3);
    assert.equal(uEvent.$el.value, 'foo');

    let delta = Date.now();
    await I.press('.input', ['b', 'a', 'r'], { delay: 50 });
    delta = Date.now() - delta;

    assert.equal(dEvent.count, 6);
    assert.equal(uEvent.count, 6);
    assert.equal(uEvent.$el.value, 'foobar');

    assert(delta > 100, (
      new assert.AssertionError({
        message: `100 < ${delta}`
      })
    ));
  });

  it('can be called with an interactor selector', async () => {
    let Test = I.extend({
      foo: () => I.press('', 'f')
    });

    let action = I.press(Test('.input'), 'a');
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
      let Test = I.extend({ selector: '.input' }, {});

      assert.typeOf(I('.input').press, 'function');
      assert.instanceOf(I('.input').press('a'), I);

      assert.typeOf(Test().press, 'function');
      assert.instanceOf(Test().press('b'), Test);

      await I('.input').press('a');
      await Test().press('b');

      assert.equal(event.count, 2);
      assert.equal(event.$el.value, 'ab');
    });

    it('can be called on nested interactors', async () => {
      let kdEvent = listen('.input', 'keydown');
      let kuEvent = listen('.input', 'keyup');
      let Test = I.extend({
        input: I('.input')
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

      let Test = I.extend({ selector: '.input' }, {
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
