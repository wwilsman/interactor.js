import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import interactor, { Interactor, keydown } from 'interactor.js';

describe('Interactor actions - keydown', () => {
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
      expect(Interactor.prototype).toHaveProperty('keydown', expect.any(Function));
      expect(new Interactor().keydown()).toBeInstanceOf(Interactor);
    });

    it('triggers a keydown event', async () => {
      let test = testDOMEvent('fieldset', 'keydown');

      await expect(
        new Interactor('fieldset').keydown('KeyA')
      ).resolves.toBeUndefined();

      expect(test.result).toBe(true);
      expect(test.event).toMatchObject({ code: 'KeyA', key: 'a', keyCode: 65 });
    });

    it('triggers a keypress and input events when a key produces text', async () => {
      let press = testDOMEvent('.input', 'keypress');
      let binput = testDOMEvent('.input', 'beforeinput');
      let input = testDOMEvent('.input', 'input');

      await expect(
        new Interactor('fieldset').keydown('input', 'KeyH')
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
        new Interactor('.input').keydown('KeyE')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('');
      expect(down.result).toBe(true);
      expect(press.result).toBe(false);
      expect(input.result).toBe(false);
    });

    it('repeats events when called more than once with the same key', async () => {
      let test = testDOMEvent('fieldset', 'keydown');

      await expect(
        new Interactor('fieldset')
          .keydown('KeyL')
          .keydown('KeyL')
      ).resolves.toBeUndefined();

      expect(test.result).toBe(true);
      expect(test.event).toHaveProperty('repeat', true);
    });

    it('sends a capital letter when the shift key is pressed', async () => {
      let input = new Interactor('.input');

      await expect(
        input
          .keydown('Shift')
          .keydown('KeyO')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('O');
    });

    it('removes the previous character with the backspace key', async () => {
      let input = new Interactor('.input');

      await expect(
        input
          .keydown('KeyH')
          .keydown('KeyA')
          .keydown('KeyL')
          .keydown('Backspace')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('ha');
    });

    it('can be called with a range', async () => {
      let input = new Interactor('.input');

      await expect(
        input
          .keydown('KeyH')
          .keydown('KeyA')
          .keydown('KeyL')
          .keydown('KeyL')
          .keydown('KeyY')
          .keydown('KeyO')
          .keydown('Backspace', { range: 1 })
          .keydown('Backspace', { range: [1, 3] })
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('ayo');
    });

    it('removes the next character with the delete key', async () => {
      let input = new Interactor('.input');

      await expect(
        input
          .keydown('KeyH')
          .keydown('KeyA')
          .keydown('KeyL')
          .keydown('Delete', { range: 2 })
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('ha');
    });

    it('sends a newline character with the enter key', async () => {
      let input = new Interactor('.textarea');

      await expect(
        input.keydown('Enter')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('\n');
    });

    it('sends a space character with the space key', async () => {
      let inp = testDOMEvent('.input', 'input');

      let input = new Interactor('.input');
      await expect(input.keydown('Space')).resolves.toBeUndefined();

      expect(input.$element.value).toBe(' ');
      expect(inp.result).toBe(true);
      expect(inp.event).toHaveProperty('code', 'Space');
      expect(inp.event).toHaveProperty('charCode', 32);
    });

    it('throws an error for unknown keys', async () => {
      await expect(
        new Interactor('fieldset').keydown('KEY')
      ).rejects.toThrow('Unknown key: "KEY"');
    });
  });

  describe('with the action creator', () => {
    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';

      keydown = key => keydown('.input', key, { range: -1 });
      typeHello = keydown('.input', 'KeyH').type('ello');
    }

    let field = new FieldInteractor();

    it('triggers the event on the specified element', async () => {
      let test = testDOMEvent('.input', 'keydown');

      await expect(
        field
          .keydown('KeyO')
          .keydown('KeyN')
      ).resolves.toBeUndefined();

      expect(field.$('.input').value).toBe('no');
      expect(test.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let test = testDOMEvent('.input', 'keydown');
      await expect(field.typeHello()).resolves.toBeUndefined();
      expect(test.$element.value).toBe('hello');
      expect(test.result).toBe(true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(keydown('.input', 'Numpad6')).toBeInstanceOf(Interactor);
    });

    it('eventually triggers the event', async () => {
      let test = testDOMEvent('.input', 'keydown');

      await expect(
        keydown('.input', '9')
      ).resolves.toBeUndefined();

      expect(test.$element.value).toBe('9');
      expect(test.result).toBe(true);
    });
  });
});
