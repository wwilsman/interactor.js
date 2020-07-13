import { assert, e, fixture, listen } from 'tests/helpers';
import Interactor, { focus } from 'interactor.js';

describe('Actions: focus', () => {
  beforeEach(() => {
    fixture(`
      <input class="input-a"/>
      <input class="input-b" disabled/>
      <h1 class="heading-a" tabindex="0"></h1>
      <h1 class="heading-b"></h1>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(focus('.input-a'), Interactor);
  });

  it('fires a focus event and focuses the element', async () => {
    let iEvent = listen('.input-a', 'focus');
    let hEvent = listen('.heading-a', 'focus');

    await focus('.input-a');
    await focus('.heading-a');

    assert.equal(iEvent.count, 1);
    assert.equal(hEvent.count, 1);
    assert.equal(hEvent.$el, document.activeElement);
  });

  it('focuses any containing documents', async () => {
    fixture(`
      <iframe
        class="test-frame"
        srcdoc="<input class='input-f'/>"
      ></iframe>
    `);

    let $f = document.querySelector('.test-frame');

    let Frame = Interactor.extend({
      interactor: { dom: () => $f.contentWindow }
    });

    await focus(Frame('.input-f'));

    assert.equal($f, document.activeElement);
    assert.equal($f.contentDocument.activeElement.className, 'input-f');
  });

  it('throws an error when focusing a disabled element', async () => {
    let event = listen('.input-b', 'focus');

    await assert.rejects(
      focus('.input-b').timeout(50),
      e('InteractorError', '.input-b is disabled')
    );

    assert.equal(event.count, 0);
  });

  it('throws an error when focusing a non-focusable element', async () => {
    let event = listen('.heading-b', 'focus');

    await assert.rejects(
      focus('.heading-b').timeout(50),
      e('InteractorError', '.heading-b is not focusable')
    );

    assert.equal(event.count, 0);
  });

  it('throws an error when the containing document cannot be focused', async () => {
    fixture(`
      <iframe
        class="test-frame"
        srcdoc="<input class='input-f'/>"
      ></iframe>
    `);

    let $f = document.querySelector('.test-frame');

    listen('.test-frame', 'focus', e => {
      e.preventDefault();
      return e.relatedTarget
        ? e.relatedTarget.focus()
        : e.currentTarget.blur();
    });

    let Frame = Interactor.extend({
      interactor: { dom: () => $f.contentWindow }
    });

    await assert.rejects(
      focus(Frame('.input-f')).timeout(50),
      e('InteractorError', 'the document is not focusable')
    );
  });

  it('can be called with an interactor selector', async () => {
    let Test = Interactor.extend({
      foo: () => focus()
    });

    let action = focus(Test('.input-a'));
    let event = listen('.input-a', 'focus');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action
      .exec($el => $el.blur())
      .foo();

    assert.equal(event.count, 2);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.input-a', 'focus');
      let Test = Interactor.extend({
        interactor: { selector: '.input-a' }
      });

      assert.typeOf(Interactor('.input-a').focus, 'function');
      assert.instanceOf(Interactor('.input-a').focus(), Interactor);

      assert.typeOf(Test().focus, 'function');
      assert.instanceOf(Test().focus(), Test);

      await Interactor('.input-a').focus();
      event.$el.blur();
      await Test().focus();

      assert.equal(event.count, 2);
    });

    it('can be overridden', async () => {
      let event = listen('.input-a', 'focus');
      let called = false;

      let Test = Interactor.extend({
        interactor: { selector: '.input-a' },
        focus: () => (called = true)
      });

      assert.typeOf(Test().focus, 'function');
      await Test().focus();

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
