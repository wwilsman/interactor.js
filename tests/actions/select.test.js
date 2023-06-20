import { assert, e, fixture, listen } from '../helpers.js';
import I from 'interactor.js';

describe('Actions: select', () => {
  beforeEach(() => {
    fixture(`
      <select class="sel-a">
        <option class="opt-1">One</option>
        <option class="opt-2">Two</option>
        <option class="opt-3" disabled>Three</option>
      </select>
      <select multiple class="sel-b">
        <option class="opt-1">One</option>
        <option class="opt-2">Two</option>
        <option class="opt-3" selected>Three</option>
      </select>
    `);
  });

  it('creates a new interactor from the standalone action', () => {
    assert.instanceOf(I.select('.sel-a', '.opt-1'), I);
  });

  it('fires input and change events on the select element', async () => {
    let iEvent = listen('.sel-a', 'input');
    let cEvent = listen('.sel-a', 'change');

    assert.equal(cEvent.$el.value, 'One');
    await I.select('.sel-a', '.opt-2');

    assert.equal(iEvent.count, 1);
    assert.equal(cEvent.count, 1);
    assert.equal(cEvent.$el.value, 'Two');
  });

  it('can select multiple options from multi select elements', async () => {
    let iEvent = listen('.sel-b', 'input');
    let cEvent = listen('.sel-b', 'change');

    assert.equal(cEvent.$el.selectedOptions.length, 1);
    assert.equal(cEvent.$el.selectedOptions[0].text, 'Three');

    await I.select('.sel-b', [I.find.text('One'), I.find.text('Three')]);
    await I.select('.sel-b', '.opt-2, .opt-3');

    assert.equal(iEvent.count, 4);
    assert.equal(cEvent.count, 4);

    assert.equal(cEvent.$el.selectedOptions.length, 3);
    assert.equal(cEvent.$el.selectedOptions[0].text, 'One');
    assert.equal(cEvent.$el.selectedOptions[1].text, 'Two');
    assert.equal(cEvent.$el.selectedOptions[2].text, 'Three');
  });

  it('throws an error when selecting a disabled option', async () => {
    let event = listen('.sel-a', 'change');

    await assert.rejects(
      I.select('.sel-a', '.opt-3').timeout(50),
      e('InteractorError', '.opt-3 within .sel-a is disabled')
    );

    assert.equal(event.count, 0);
  });

  it('throws an error when selecting from a disabled select element', async () => {
    let event = listen('.sel-a', 'change');
    event.$el.disabled = true;

    await assert.rejects(
      I.select('.sel-a', '.opt-2').timeout(50),
      e('InteractorError', '.sel-a is disabled')
    );

    assert.equal(event.count, 0);
  });

  it('throws an error when selecting multiple options from a normal select element', async () => {
    let event = listen('.sel-a', 'change');

    await assert.rejects(
      I.select('.sel-a', ['.opt-1', 'opt-2']).timeout(50),
      e('InteractorError', '.sel-a is not a multi select element')
    );

    assert.equal(event.count, 0);
  });

  it('throws an error when the element is not a select element', async () => {
    let event = listen('#test', 'change');

    await assert.rejects(
      I.select('#test', '.opt-1').timeout(50),
      e('InteractorError', '#test is not a select element')
    );

    assert.equal(event.count, 0);
  });

  it('can be called with an interactor selector', async () => {
    let Test = I.extend({
      foo: () => I.select('&', '.opt-2')
    });

    let action = I.select(Test('.sel-a'), I.find.text('Two'));
    let event = listen('.sel-a', 'change');

    assert.instanceOf(action, Test);
    assert.equal(event.count, 0);

    await action.foo();

    assert.equal(event.count, 2);
  });

  describe('method', () => {
    it('can be called on any interactor', async () => {
      let event = listen('.sel-a', 'change');
      let Test = I.extend({ selector: '.sel-a' }, {});

      assert.typeOf(I('.sel-a').select, 'function');
      assert.instanceOf(I('.sel-a').select('.opt-2'), I);

      assert.typeOf(Test().select, 'function');
      assert.instanceOf(Test().select('.opt-1'), Test);

      await I('.sel-a').select('.opt-2');
      await Test().select('.opt-1');

      assert.equal(event.count, 2);
    });

    it('can be overridden', async () => {
      let event = listen('.sel-a', 'change');
      let called = false;

      let Test = I.extend({ selector: '.sel-a' }, {
        select: () => (called = true)
      });

      assert.typeOf(Test().select, 'function');
      await Test().select('.opt-2');

      assert.equal(event.count, 0);
      assert.equal(called, true);
    });
  });
});
