import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import interactor, { Interactor, press } from 'interactor.js';

describe('Interactor actions - press', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input class="input"/>
        <textarea class="textarea"></textarea>
      </fieldset>
    `);
  });

  describe('with the default method', () => {
    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('press', expect.any(Function));
      expect(new Interactor().press()).toBeInstanceOf(Interactor);
    });

    it('triggers a keydown and keyup event', async () => {
      let down = testDOMEvent('fieldset', 'keydown');
      let up = testDOMEvent('fieldset', 'keyup');

      await expect(
        new Interactor('fieldset').press('KeyA')
      ).resolves.toBeUndefined();

      expect(down.result).toBe(true);
      expect(up.result).toBe(true);
      expect(down.event).toMatchObject({ code: 'KeyA', key: 'a', keyCode: 65 });
      expect(up.event).toMatchObject({ code: 'KeyA', key: 'a', keyCode: 65 });
    });

    it('triggers a keypress and input events when a key produces text', async () => {
      let press = testDOMEvent('.input', 'keypress');
      let binput = testDOMEvent('.input', 'beforeinput');
      let input = testDOMEvent('.input', 'input');

      await expect(
        new Interactor('fieldset').press('input', 'KeyH')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('h');
      expect(press.result).toBe(true);
      expect(binput.result).toBe(true);
      expect(input.result).toBe(true);
    });

    it('can prevent keypress and input events', async () => {
      let down = testDOMEvent('.input', 'keydown', e => e.preventDefault());
      let press = testDOMEvent('.input', 'keypress');
      let input = testDOMEvent('.input', 'input');

      await expect(
        new Interactor('.input').press('KeyE')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('');
      expect(down.result).toBe(true);
      expect(press.result).toBe(false);
      expect(input.result).toBe(false);
    });

    it('sends a capital letter when the shift key is pressed', async () => {
      let input = new Interactor('.input');

      await expect(
        input
          .keydown('Shift')
          .press('KeyO')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('O');
    });

    it('removes the previous character with the backspace key', async () => {
      let input = new Interactor('.input');

      await expect(
        input
          .press('KeyH')
          .press('KeyA')
          .press('KeyL')
          .press('Backspace')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('ha');
    });

    it('can be called with a range', async () => {
      let input = new Interactor('.input');

      await expect(
        input
          .press('KeyH')
          .press('KeyA')
          .press('KeyL')
          .press('KeyL')
          .press('KeyY')
          .press('KeyO')
          .press('Backspace', { range: 1 })
          .press('Backspace', { range: [1, 3] })
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('ayo');
    });

    it('removes the next character with the delete key', async () => {
      let input = new Interactor('.input');

      await expect(
        input
          .press('KeyH')
          .press('KeyA')
          .press('KeyL')
          .press('Delete', { range: 2 })
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('ha');
    });

    it('sends a newline character with the enter key', async () => {
      let input = new Interactor('.textarea');

      await expect(
        input.press('Enter')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('\n');
    });

    it('sends a space character with the space key', async () => {
      let inp = testDOMEvent('.input', 'input');

      let input = new Interactor('.input');
      await expect(input.press('Space')).resolves.toBeUndefined();

      expect(input.$element.value).toBe(' ');
      expect(inp.result).toBe(true);
      expect(inp.event).toHaveProperty('code', 'Space');
      expect(inp.event).toHaveProperty('charCode', 32);
    });

    it('can delay between keydown and keyup events', async () => {
      let times = [];
      testDOMEvent('.input', 'keydown', () => times[0] = Date.now());
      testDOMEvent('.input', 'keyup', () => times[1] = Date.now());

      await expect(
        new Interactor('.input').press('ArrowUp', { delay: 50 })
      ).resolves.toBeUndefined();

      expect(times[1] - times[0]).toBeGreaterThanOrEqual(50);
    });

    it('throws an error for unknown keys', async () => {
      await expect(
        new Interactor('fieldset').press('KEY')
      ).rejects.toThrow('Unknown key: "KEY"');
    });
  });

  describe('with the action creator', () => {
    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';

      keydown = key => press('.input', key, { range: -1 });
      typeHello = press('.input', 'KeyH').type('ello');
    }

    let field = new FieldInteractor();

    it('triggers the event on the specified element', async () => {
      let down = testDOMEvent('.input', 'keydown');
      let up = testDOMEvent('.input', 'keyup');

      await expect(
        field
          .keydown('KeyO')
          .keydown('KeyN')
      ).resolves.toBeUndefined();

      expect(field.$('.input').value).toBe('no');
      expect(down.result).toBe(true);
      expect(up.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let down = testDOMEvent('.input', 'keydown');
      let up = testDOMEvent('.input', 'keyup');
      await expect(field.typeHello()).resolves.toBeUndefined();
      expect(field.$('.input').value).toBe('hello');
      expect(down.result).toBe(true);
      expect(up.result).toBe(true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(press('.input', 'Numpad6')).toBeInstanceOf(Interactor);
    });

    it('eventually triggers the event', async () => {
      let down = testDOMEvent('.input', 'keydown');
      let up = testDOMEvent('.input', 'keyup');

      await expect(
        press('.input', '9')
      ).resolves.toBeUndefined();

      expect(down.$element.value).toBe('9');
      expect(down.result).toBe(true);
      expect(up.result).toBe(true);
    });
  });
});
