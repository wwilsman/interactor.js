import { assert, fixture, listen } from '../helpers.js';
import I from 'interactor.js';

describe('Actions: type', () => {
  beforeEach(() => {
    fixture(`
      <input class="input"/>
      <textarea class="textarea"></textarea>
      <div class="contenteditable" contenteditable></div>
      <div class="just-a-div" tabindex="0"></div>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(I.type('.input', 'foo'), I);
  });

  it('fires various keyboard events on the element for each character', async () => {
    let kdEvent = listen('.input', 'keydown');
    let kpEvent = listen('.input', 'keypress');
    let biEvent = listen('.input', 'beforeinput');
    let inEvent = listen('.input', 'input');
    let kuEvent = listen('.input', 'keyup');

    await I.type('.input', 'foo');

    assert.equal(kdEvent.count, 3, 'kdEvent');
    assert.equal(kpEvent.count, 3, 'kpEvent');
    assert.equal(biEvent.count, 3, 'biEvent');
    assert.equal(inEvent.count, 3, 'inEvent');
    assert.equal(kuEvent.count, 3, 'kuEvent');
  });

  it('updates the value of the element', async () => {
    let event = listen('.input', 'input');
    await I.type('.input', 'foo');
    assert.equal(event.$el.value, 'foo');
  });

  it('replaces text within the specified range', async () => {
    let event = listen('.textarea', 'input');
    event.$el.value = 'foobar';

    await I.type('.textarea', 'test', { range: [3, 6] });

    assert.equal(event.count, 4);
    assert.equal(event.$el.value, 'footest');
  });

  it('can replace values entirely', async () => {
    let event = listen('.input', 'keydown');
    event.$el.value = 'foo';

    await I.type('.input', 'bar', { replace: true });

    assert.equal(event.$el.value, 'bar');
  });

  it('can replace any existing selected text range', async () => {
    let event = listen('.input', 'keydown');
    event.$el.value = 'foobar';
    event.$el.setSelectionRange(3, 6);

    await I.type('.input', 'foo');

    assert.equal(event.$el.value, 'foofoo');
  });

  it('can delay key presses', async () => {
    let time = Date.now();
    let delta = 0;

    listen('.input', 'input', () => {
      delta += Date.now() - time;
      time = Date.now();
    });

    await I.type('.input', 'test', { delay: 50 });

    assert(delta > 150 && delta < 200, (
      new assert.AssertionError({
        message: `150 < ${delta} < 200`
      })
    ));
  });

  it('can trigger a change event for form elements', async () => {
    let iEvent = listen('.input', 'change');
    let eEvent = listen('.contenteditable', 'change');

    await I.type('.input', 'foo', { change: true });
    await I.type('.contenteditable', 'bar', { change: true });

    assert.equal(iEvent.count, 1);
    assert.equal(iEvent.$el.value, 'foo');
    assert.equal(eEvent.count, 0);
    assert.equal(eEvent.$el.textContent, 'bar');
  });

  it('can trigger a focus event before and a blur event after typing', async () => {
    let fEvent = listen('.input', 'focus');
    let iEvent = listen('.input', 'input');
    let bEvent = listen('.input', 'blur');

    await I.type('.input', 'fill');

    assert.equal(fEvent.count, 1, 'fEvent');
    assert.equal(iEvent.count, 4, 'iEvent');
    assert.equal(bEvent.count, 1, 'bEvent');
    assert.equal(iEvent.$el.value, 'fill');

    await I.type('.input', 'oo', {
      range: [1, 4],
      focus: false,
      blur: false
    });

    assert.equal(fEvent.count, 1, 'fEvent');
    assert.equal(iEvent.count, 6, 'iEvent');
    assert.equal(bEvent.count, 1, 'bEvent');
    assert.equal(iEvent.$el.value, 'foo');
  });

  it('does not insert text into an element that does not accept input', async () => {
    let eEvent = listen('.contenteditable', 'input');
    let dEvent = listen('.just-a-div', 'input');

    await I.type('.contenteditable', 'foo');
    await I.type('.just-a-div', 'bar');

    assert.equal(eEvent.count, 3);
    assert.equal(eEvent.$el.textContent, 'foo');
    assert.equal(dEvent.count, 0);
    assert.equal(dEvent.$el.textContent, '');
  });

  it('does not insert text when previous events are cancelled', async () => {
    let kdEvent = listen('.input', 'keydown');
    let kpEvent = listen('.input', 'keypress');
    let biEvent = listen('.input', 'beforeinput');
    let inEvent = listen('.input', 'input');

    inEvent.$el.addEventListener('beforeinput', e => e.preventDefault());
    await I.type('.input', 'f');

    assert.equal(inEvent.count, 0);
    assert.equal(biEvent.count, 1);
    assert.equal(kpEvent.count, 1);
    assert.equal(kdEvent.count, 1);
    assert.equal(kdEvent.$el.value, '');

    inEvent.$el.addEventListener('keypress', e => e.preventDefault());
    await I.type('.input', 'f');

    assert.equal(inEvent.count, 0);
    assert.equal(biEvent.count, 1);
    assert.equal(kpEvent.count, 2);
    assert.equal(kdEvent.count, 2);
    assert.equal(kdEvent.$el.value, '');

    inEvent.$el.addEventListener('keydown', e => e.preventDefault());
    await I.type('.input', 'f');

    assert.equal(inEvent.count, 0);
    assert.equal(biEvent.count, 1);
    assert.equal(kpEvent.count, 2);
    assert.equal(kdEvent.count, 3);
    assert.equal(kdEvent.$el.value, '');
  });

  it('preserves framework value descriptors', async () => {
    let event = listen('.input', 'input');
    Object.defineProperty(event.$el, 'value', {
      configurable: true,
      value: 'f'
    });

    await I.type('.input', 'oo');

    assert.equal(event.count, 2);
    assert.equal(event.$el.value, 'f');
  });

  it('can be called with an interactor selector', async () => {
    let Test = I.extend({
      foo: () => I.type('', 'foo')
    });

    let action = I.type(Test('.input'), 'aaa');
    let event = listen('.input', 'input');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.foo();

    assert.equal(event.count, 6);
    assert.equal(event.$el.value, 'aaafoo');
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.input', 'input');
      let Test = I.extend({ selector: '.input' }, {});

      assert.typeOf(I('.input').type, 'function');
      assert.instanceOf(I('.input').type('foo'), I);

      assert.typeOf(Test().type, 'function');
      assert.instanceOf(Test().type('bar'), Test);

      await I('.input').type('foo');
      await Test().type('bar');

      assert.equal(event.count, 6);
      assert.equal(event.$el.value, 'foobar');
    });

    it('can type into nested interactors', async () => {
      let event = listen('.input', 'input');
      let Test = I.extend({
        input: I('.input')
      });

      await Test()
        .input.type('Foo')
        .input.type('Bar');

      assert.equal(event.count, 6);
      assert.equal(event.$el.value, 'FooBar');
    });

    it('can be overridden', async () => {
      let event = listen('.input', 'input');
      let called = false;

      let Test = I.extend({ selector: '.input' }, {
        type: () => (called = true)
      });

      assert.typeOf(Test().type, 'function');
      await Test().type('test');

      assert.equal(event.count, 0);
      assert.equal(event.$el.value, '');
      assert.equal(called, true);
    });

    it('does not send text when a modifier is pressed', async () => {
      let kdEvent = listen('.input', 'keydown');
      let kuEvent = listen('.input', 'keyup');
      let inEvent = listen('.input', 'input');

      await I('.input')
        .keydown('Control')
        .type('foo');

      assert.equal(kdEvent.count, 4);
      assert.equal(kuEvent.count, 3);
      assert.equal(inEvent.count, 0);
      assert.equal(kdEvent.$el.value, '');
    });
  });
});
