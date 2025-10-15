import { describe, it } from 'moonshiner';
import { I, assert, fixture, listen } from '../helpers';

describe('Actions | #press(keys, options?)', () => {
  it('triggers keyboard events for the current element', async () => {
    fixture('<div class="foo">Foo</div>');

    let events = {
      keydown: listen('.foo', 'keydown'),
      beforeinput: listen('.foo', 'beforeinput'),
      input: listen('.foo', 'input'),
      keyup: listen('.foo', 'keyup')
    };

    await I.find('Foo')
      .then.press('Delete');

    for (let event in events) {
      if (event === 'keydown' || event === 'keyup') {
        await assert(
          events[event].calls.length === 1 &&
          events[event].calls[0][0].key === 'Delete',
          `Expected \`${event}\` event for "Delete"`);
      } else {
        await assert(events[event].calls.length === 0,
          `Unexpected \`${event}\` event for "Delete"`);
      }
    }
  });

  it('triggers input events for the current input element', async () => {
    fixture('<input placeholder="Bar" />');

    let events = {
      keydown: listen('input', 'keydown'),
      beforeinput: listen('input', 'beforeinput', e => {
        if (e.key === 'C') e.preventDefault();
      }),
      input: listen('input', 'input'),
      keyup: listen('input', 'keyup')
    };

    await I.find('Bar')
      .then.press('B');

    for (let event in events) {
      await assert(
        events[event].calls.length === 1 &&
        events[event].calls[0][0].key === 'B',
        `Expected \`${event}\` event for "B"`);
    }

    await I.find('Bar')
      .then.press('C');

    await assert(events.beforeinput.calls.length === 2,
      'Expected a second beforeinput event');
    await assert(events.input.calls.length === 1,
      'Expected second input event to be canceled');
  });

  it('returns the current element', async () => {
    fixture('<div class="foo">Foo</div>');

    let $ = await I.find('Foo')
      .then.press('Delete');

    await assert($.className === 'foo',
      'Expected the returned element to be "Foo"');
  });

  it('does not update the context element', async () => {
    fixture('<div class="foo">Foo</div>');

    let $ = await I.find('Foo')
      .then.press('Delete')
      .then.act(({ $ }) => $);

    await assert($.className === 'foo',
      'Expected the returned element to be "Foo"');
  });

  it('does not accept arbitrary key names', async () => {
    await assert.throws(() => I.press('KeyFoo'),
      'Unknown key `KeyFoo`');
  });

  it('can insert or replace text within relevant elements', async () => {
    fixture('<div contenteditable>Fo</div>');

    /** @type {HTMLElement} */
    let $ = document.querySelector('[contenteditable]');

    await I.find($)
      .then.press('KeyO');

    await assert($.innerText === 'Foo',
      'Expected content editable text to be "Foo"');

    await I.find($)
      .then.press('!', { replace: true });

    await assert($.innerText === '!',
      'Expected content editable text to be "!"');

    $.innerText = 'Bar';

    await I.find($)
      .then.press('z', { range: [2, 3] });

    await assert($.innerText === 'Baz',
      'Expected content editable text to be "Baz"');
  });

  it('replaces any existing text selection', async () => {
    fixture('<div contenteditable>Qoox</div>');

    /** @type {HTMLElement} */
    let $ = document.querySelector('[contenteditable]');

    let range = document.createRange();
    range.setStart($.firstChild, 1);
    range.setEnd($.firstChild, 3);
    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    await I.find($)
      .then.press('u');

    await assert($.innerText === 'Qux',
      'Expected content editable text to be "Qux"');
  });

  it('can delete text within relevant elements', async () => {
    fixture('<input placeholder="Foo" value="FFooo" />');

    await I.find('Foo')
      .then.press('Backspace')
      .then.press('Delete', { range: 0 });

    await assert(document.querySelector('input').value === 'Foo',
      'Expected "Foo" value to be "Foo"');
  });

  it('can hold a key in an interaction until the next press', async () => {
    fixture('<input placeholder="Baz" />');

    await I.find('Baz')
      .then.press('Shift', { hold: true })
      .then.press('KeyB')
      .then.press('Shift')
      .then.press(['KeyA', 'KeyZ'])
      .then.press(['Shift', 'Digit1']);

    await assert(document.querySelector('input').value === 'Baz!',
      'Expected "Baz" to have a value of "Baz!"');
  });

  it('retains any custom value descriptors for relevant elements', async () => {
    fixture('<input placeholder="Qux" />');
    let $input = document.querySelector('input');
    let value = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');

    Object.defineProperty($input, 'value', {
      ...value, get: () => value.get.apply($input) + 'oo'
    });

    await I.find('Qux')
      .then.press('KeyF');

    await assert($input.value === 'foo',
      'Expected "Qux" value to be "foo"');
  });
});
