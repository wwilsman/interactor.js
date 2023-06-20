import { assert, e, fixture, listen } from '../helpers.js';
import I from 'interactor.js';

describe('Actions: keydown', () => {
  beforeEach(() => {
    fixture(`
      <input class="input"/>
      <textarea class="textarea"></textarea>
      <div class="contenteditable" contenteditable></div>
      <div class="just-a-div"></div>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(I.keydown('.input', 'f'), I);
  });

  it('fires a keydown event on the element', async () => {
    let event = listen('.input', 'keydown');
    await I.keydown('.input', 'f');
    assert.equal(event.count, 1);
  });

  it('sends text for keys that produce text', async () => {
    let event = listen('.input', 'keydown');
    await I.keydown('.input', 'f');
    assert.equal(event.$el.value, 'f');
  });

  it('does not send text for keys that do not produce text', async () => {
    let event = listen('.input', 'keydown');
    await I.keydown('.input', 'Control');
    assert.equal(event.count, 1);
    assert.equal(event.$el.value, '');
  });

  it('deletes text for backspace or delete', async () => {
    let event = listen('.textarea', 'keydown');
    event.$el.value = 'foobar';

    await I.keydown('.textarea', 'Backspace', { range: 4 });
    await I.keydown('.textarea', 'Delete', { range: 3 });
    await I.keydown('.textarea', 'Delete', { range: [3, 4] });

    assert.equal(event.count, 3);
    assert.equal(event.$el.value, 'foo');
  });

  it('can replace values entirely', async () => {
    let event = listen('.input', 'keydown');
    event.$el.value = 'foobar';

    await I.keydown('.input', 'a', { replace: true });

    assert.equal(event.$el.value, 'a');
  });

  it('can replace an existing input text range', async () => {
    let event = listen('.input', 'keydown');
    event.$el.value = 'foobar';
    event.$el.setSelectionRange(1, 4);

    await I.keydown('.input', 'b');

    assert.equal(event.$el.value, 'fbar');
  });

  it('can replace an existing content-editable text range', async () => {
    let event = listen('.contenteditable', 'keydown');
    event.$el.textContent = 'foobar';

    let range = document.createRange();
    range.setStart(event.$el.firstChild, 1);
    range.setEnd(event.$el.firstChild, 3);
    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    await I.keydown('.contenteditable', 'f');

    assert.equal(event.$el.textContent, 'ffbar');
  });

  it('does not enter text for elements that cannot accept input', async () => {
    let eEvent = listen('.contenteditable', 'keydown');
    let dEvent = listen('.just-a-div', 'keydown');

    await I.keydown('.contenteditable', 'a');
    await I.keydown('.just-a-div', 'b');

    assert.equal(eEvent.count, 1);
    assert.equal(eEvent.$el.textContent, 'a');
    assert.equal(dEvent.count, 1);
    assert.equal(dEvent.$el.textContent, '');
  });

  it('can be called with an interactor selector', async () => {
    let Test = I.extend({
      foo: () => I.keydown('&', 'f')
    });

    let action = I.keydown(Test('.input'), 'a');
    let event = listen('.input', 'keydown');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.foo();

    assert.equal(event.count, 2);
    assert.equal(event.$el.value, 'af');
  });

  it('throws with an unkown key', () => {
    assert.throws(
      () => I.keydown('.input', 'U_KEY'),
      e('InteractorError', 'unknown key `U_KEY`')
    );
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.input', 'keydown');
      let Test = I.extend({ selector: '.input' }, {});

      assert.typeOf(I('.input').keydown, 'function');
      assert.instanceOf(I('.input').keydown('a'), I);

      assert.typeOf(Test().keydown, 'function');
      assert.instanceOf(Test().keydown('b'), Test);

      await I('.input').keydown('a');
      await Test().keydown('b');

      assert.equal(event.count, 2);
      assert.equal(event.$el.value, 'ab');
    });

    it('persists nested keys throughout the interactor', async () => {
      let event = listen('.input', 'keydown');
      let Test = I.extend({
        input: I('.input')
      });

      await Test()
        .input.keydown('KeyA')
        .input.keydown('Shift')
        .input.keydown('KeyA');

      assert.equal(event.count, 3);
      assert.equal(event.$el.value, 'aA');
    });

    it('can be overridden', async () => {
      let event = listen('.input', 'keydown');
      let called = false;

      let Test = I.extend({ selector: '.input' }, {
        keydown: () => (called = true)
      });

      assert.typeOf(Test().keydown, 'function');
      await Test().keydown('t');

      assert.equal(event.count, 0);
      assert.equal(event.$el.value, '');
      assert.equal(called, true);
    });

    it('does not send text when a modifier is pressed', async () => {
      let event = listen('.input', 'keydown');

      await I('.input')
        .keydown('Control')
        .keydown('f');

      assert.equal(event.count, 2);
      assert.equal(event.$el.value, '');
    });

    it('uses shift keys when shift is pressed', async () => {
      let event = listen('.input', 'keydown');

      await I('.input')
        .keydown('Digit1')
        .keydown('KeyA')
        .keydown('Shift')
        .keydown('Digit1')
        .keydown('KeyA');

      assert.equal(event.count, 5);
      assert.equal(event.$el.value, '1a!A');
    });
  });
});
