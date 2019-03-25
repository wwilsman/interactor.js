import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import interactor, { Interactor, type } from 'interactor.js';

describe('Interactor actions - type', () => {
  beforeEach(() => {
    injectHtml(`
      <input class="input"/>
      <textarea class="textarea"></textarea>
      <div class="editable" contenteditable></div>
      <div class="noneditable"></div>
    `);
  });

  describe('with the default method', () => {
    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('type', expect.any(Function));
      expect(new Interactor().type()).toBeInstanceOf(Interactor);
    });

    it('can type into input elements', async () => {
      let down = testDOMEvent('.input', 'keydown');
      let press = testDOMEvent('.input', 'keypress');
      let inp = testDOMEvent('.input', 'input');
      let up = testDOMEvent('.input', 'keyup');

      let input = new Interactor('.input');
      await expect(input.type('hello!')).resolves.toBeUndefined();

      expect(input.$element.value).toBe('hello!');
      expect(down.result).toBe(true);
      expect(press.result).toBe(true);
      expect(inp.result).toBe(true);
      expect(up.result).toBe(true);
    });

    it('can type into textarea elements', async () => {
      let down = testDOMEvent('.textarea', 'keydown');
      let press = testDOMEvent('.textarea', 'keypress');
      let input = testDOMEvent('.textarea', 'input');
      let up = testDOMEvent('.textarea', 'keyup');

      let textarea = new Interactor();
      await expect(textarea.type('.textarea', 'heyoo!')).resolves.toBeUndefined();

      expect(input.$element.value).toBe('heyoo!');
      expect(down.result).toBe(true);
      expect(press.result).toBe(true);
      expect(input.result).toBe(true);
      expect(up.result).toBe(true);
    });

    it('can type into contenteditable elements', async () => {
      let down = testDOMEvent('.editable', 'keydown');
      let press = testDOMEvent('.editable', 'keypress');
      let input = testDOMEvent('.editable', 'input');
      let up = testDOMEvent('.editable', 'keyup');

      let editable = new Interactor('.editable');
      await expect(editable.type('foo bar')).resolves.toBeUndefined();

      expect(editable.$element.textContent).toBe('foo bar');
      expect(down.result).toBe(true);
      expect(press.result).toBe(true);
      expect(input.result).toBe(true);
      expect(up.result).toBe(true);
    });

    it('throws an error on disabled inputs', async () => {
      let input = new Interactor('.input').timeout(50);
      input.$element.disabled = true;
      await expect(input.type('disabled?')).rejects.toThrow('disabled');
    });

    it('throws an error on non-typable elements', async () => {
      let noneditable = new Interactor('.noneditable').timeout(50);
      await expect(noneditable.type('hello?')).rejects
        .toThrow('not an input, textarea, or content editable element');
    });

    it('can prevent a keypress event', async () => {
      let down = testDOMEvent('.input', 'keydown', e => e.preventDefault());
      let press = testDOMEvent('.input', 'keypress');
      let inp = testDOMEvent('.input', 'input');
      let up = testDOMEvent('.input', 'keyup');

      let input = new Interactor('.input');
      await expect(input.type('no keypress')).resolves.toBeUndefined();

      expect(input.$element.value).toBe('');
      expect(down.result).toBe(true);
      expect(press.result).toBe(false);
      expect(inp.result).toBe(false);
      expect(up.result).toBe(true);
    });

    it('can prevent an input event', async () => {
      let down = testDOMEvent('.input', 'keydown');
      let press = testDOMEvent('.input', 'keypress', e => e.preventDefault());
      let inp = testDOMEvent('.input', 'input');
      let up = testDOMEvent('.input', 'keyup');

      let input = new Interactor('.input');
      await expect(input.type('no input')).resolves.toBeUndefined();

      expect(input.$element.value).toBe('');
      expect(down.result).toBe(true);
      expect(press.result).toBe(true);
      expect(inp.result).toBe(false);
      expect(up.result).toBe(true);
    });

    it('can delay between typing characters', async () => {
      let start = Date.now();
      let input = new Interactor('.input');
      await expect(input.type('abc', { delay: 50 })).resolves.toBeUndefined();
      expect(Date.now() - start).toBeGreaterThanOrEqual(100);
    });

    it('can activate and deactivate the alt key', async () => {
      let test = testDOMEvent('.input', 'input');
      let input = new Interactor('.input');

      await expect(input.type('{alt}x')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('x');
      expect(test.event).toHaveProperty('altKey', true);

      await expect(input.type('{alt}y{alt}z')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('xyz');
      expect(test.event).toHaveProperty('altKey', false);
    });

    it('can activate and deactivate the ctrl key', async () => {
      let test = testDOMEvent('.input', 'input');
      let input = new Interactor('.input');

      await expect(input.type('{ctrl}x')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('x');
      expect(test.event).toHaveProperty('ctrlKey', true);

      await expect(input.type('{ctrl}y{ctrl}z')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('xyz');
      expect(test.event).toHaveProperty('ctrlKey', false);
    });

    it('can activate and deactivate the meta key', async () => {
      let test = testDOMEvent('.input', 'input');
      let input = new Interactor('.input');

      await expect(input.type('{cmd}x')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('x');
      expect(test.event).toHaveProperty('metaKey', true);

      await expect(input.type('{cmd}y{cmd}z')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('xyz');
      expect(test.event).toHaveProperty('metaKey', false);
    });

    it('can activate and deactivate the shift key', async () => {
      let test = testDOMEvent('.input', 'input');
      let input = new Interactor('.input');

      await expect(input.type('{shift}x')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('x');
      expect(test.event).toHaveProperty('shiftKey', true);

      await expect(input.type('{shift}y{shift}z')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('xyz');
      expect(test.event).toHaveProperty('shiftKey', false);
    });

    it('can remove characters with backspace', async () => {
      let input = new Interactor('.input');
      await expect(input.type('helli{backspace}o')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('hello');

      let editable = new Interactor('.editable');
      await expect(editable.type('work{backspace}ld')).resolves.toBeUndefined();
      expect(editable.$element.textContent).toBe('world');
    });

    it('can repeat non-printable keys', async () => {
      let input = new Interactor('.input');
      await expect(input.type('hello{backspace:5}world')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('world');
    });

    it('can trigger a beforeinput event', async () => {
      let val = [];

      let before = testDOMEvent('.input', 'beforeinput', e => val[0] = e.target.value);
      let inp = testDOMEvent('.input', 'input', e => val[1] = e.target.value);

      let input = new Interactor('.input');
      await expect(input.type('a', { beforeinput: true })).resolves.toBeUndefined();

      expect(val[0]).toBe('');
      expect(before.result).toBe(true);
      expect(val[1]).toBe('a');
      expect(inp.result).toBe(true);
    });

    it('can cancel a beforeinput event', async () => {
      let before = testDOMEvent('.input', 'beforeinput', e => e.preventDefault());
      let inp = testDOMEvent('.input', 'input');

      let input = new Interactor('.input');
      await expect(input.type('a', { beforeinput: true })).resolves.toBeUndefined();

      expect(before.result).toBe(true);
      expect(inp.result).toBe(false);
    });

    it('can trigger a change event', async () => {
      let n = 0;
      let change = testDOMEvent('.input', 'change', () => n++);

      let input = new Interactor('.input');
      await expect(input.type('change', { change: true })).resolves.toBeUndefined();

      expect(input.$element.value).toBe('change');
      expect(change.result).toBe(true);
      expect(n).toBe(1);
    });

    it('sends a space character with the space key', async () => {
      let inp = testDOMEvent('.input', 'input');

      let input = new Interactor('.input');
      await expect(input.type(' ')).resolves.toBeUndefined();

      expect(input.$element.value).toBe(' ');
      expect(inp.result).toBe(true);
      expect(inp.event).toHaveProperty('key', 'Space');
      expect(inp.event).toHaveProperty('charCode', 32);
    });

    it('does not send a keypress event for non-printable keys', async () => {
      let down = testDOMEvent('.input', 'keydown');
      let press = testDOMEvent('.input', 'keypress');
      let inp = testDOMEvent('.input', 'input');
      let up = testDOMEvent('.input', 'keyup');

      let input = new Interactor('.input');
      await expect(input.type('{up}')).resolves.toBeUndefined();

      expect(input.$element.value).toBe('');
      expect(down.result).toBe(true);
      expect(press.result).toBe(false);
      expect(inp.result).toBe(false);
      expect(up.result).toBe(true);
      expect(up.event).toHaveProperty('key', 'ArrowUp');
    });
  });

  describe('with the action creator', () => {
    @interactor class InputInteractor {
      static defaultScope = '.input';

      withCtrl = val => type(val, { ctrlKey: true });
      typeit = type('it').assert(element => {
        expect(element.value).toBe('it');
      });
    }

    let input = new InputInteractor();

    it('types into the element', async () => {
      let test = testDOMEvent('.input', 'input');
      await expect(input.withCtrl('hello world')).resolves.toBeUndefined();
      expect(input.$element.value).toBe('hello world');
      expect(test.result).toBe(true);
      expect(test.event).toHaveProperty('ctrlKey', true);
    });

    it('can chain other interactor methods', async () => {
      let test = testDOMEvent('.input', 'input');
      await expect(input.typeit()).resolves.toBeUndefined();
      expect(input.$element.value).toBe('it');
      expect(test.result).toBe(true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(type('.input', 'ayyy')).toBeInstanceOf(Interactor);
    });

    it('eventually types into the element', async () => {
      let test = testDOMEvent('.input', 'input');

      await expect(
        type('.input', 'ayo', { altKey: true })
      ).resolves.toBeUndefined();

      expect(test.$element.value).toBe('ayo');
      expect(test.result).toBe(true);
      expect(test.event).toHaveProperty('altKey', true);
    });
  });
});
