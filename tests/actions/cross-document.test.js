import { describe, it, beforeEach, afterEach } from 'moonshiner';
import { Interactor } from 'interactor.js';
import { assert, fixture } from '../helpers';

describe('Actions | elements in another document', () => {
  let frame;
  let I;

  beforeEach(async () => {
    fixture('');
    frame = document.createElement('iframe');
    let loaded = new Promise(resolve => frame.addEventListener('load', resolve, { once: true }));
    frame.srcdoc = '<button>Save</button><input placeholder="Name"><output></output>';
    document.getElementById('testing-root').append(frame);
    await loaded;

    I = new Interactor({
      root: () => frame.contentDocument.body,
      assert: { timeout: 100, reliability: 0 }
    });
  });

  afterEach(() => {
    frame.remove();
    window.focus();
  });

  it('creates triggered events in the target document', async () => {
    let win = frame.contentWindow;
    let output = win.document.querySelector('output');
    win.document.querySelector('input').addEventListener('keydown', event => {
      if (event instanceof win.Event) output.textContent = event.key;
    });

    await I.find('Name').then.press('a');

    await I.find('Name').value('a');
    await assert(output.textContent === 'a',
      'Expected the input handler to receive an event from its own window');
  });

  it('creates clicks with the target window as their view', async () => {
    let win = frame.contentWindow;
    let output = win.document.querySelector('output');
    win.document.querySelector('button').addEventListener('click', event => {
      if (event instanceof win.MouseEvent && event.view === win)
        output.textContent = 'Saved';
    });

    await I.click('Save');

    await assert(output.textContent === 'Saved',
      'Expected the click handler to receive a mouse event from its own window');
  });

  it('checks focus in the target document', async () => {
    await I.focus('Name');
    await I.find('Name').focused();
    await I.find('Save').not.focused();

    await assert.throws(I.find('Save').focused(), '"Save" is not focused');
    await assert.throws(I.find('Name').not.focused(), '"Name" is focused');
  });
});
