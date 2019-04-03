import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import interactor, { Interactor, keyup } from 'interactor.js';

describe('Interactor actions - keyup', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input class="input"/>
      </fieldset>
    `);
  });

  describe('with the default method', () => {
    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('keyup', expect.any(Function));
      expect(new Interactor().keyup()).toBeInstanceOf(Interactor);
    });

    it('triggers a keyup event', async () => {
      let test = testDOMEvent('fieldset', 'keyup');

      await expect(
        new Interactor('fieldset').keyup('KeyA')
      ).resolves.toBeUndefined();

      expect(test.result).toBe(true);
      expect(test.event).toMatchObject({ code: 'KeyA', key: 'a', keyCode: 65 });
    });

    it('can stop repeated keydown events', async () => {
      let test = testDOMEvent('fieldset', 'keydown');

      await expect(
        new Interactor('fieldset')
          .keydown('KeyL')
          .keyup('KeyL')
          .keydown('KeyL')
      ).resolves.toBeUndefined();

      expect(test.result).toBe(true);
      expect(test.event).toHaveProperty('repeat', false);
    });

    it('stops capitalization with the shift key', async () => {
      let input = new Interactor('.input');

      await expect(
        input
          .keydown('Shift')
          .keydown('KeyN')
          .keyup('Shift')
          .keydown('KeyO')
      ).resolves.toBeUndefined();

      expect(input.$element.value).toBe('No');
    });
  });

  describe('with the action creator', () => {
    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';

      keyup = key => keyup('.input', key);
      releaseShift = keyup('.input', 'Shift').assert(element => {
        expect(element.value).toBe('H');
      });
    }

    let field = new FieldInteractor();

    it('triggers the event on the specified element', async () => {
      let test = testDOMEvent('.input', 'keyup');

      await expect(
        field.keyup('Control')
      ).resolves.toBeUndefined();

      expect(test.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let test = testDOMEvent('.input', 'keyup');

      await expect(
        field
          .keydown('.input', 'Shift')
          .keydown('.input', 'KeyH')
          .releaseShift()
          .keydown('.input', 'KeyI')
      ).resolves.toBeUndefined();

      expect(test.$element.value).toBe('Hi');
      expect(test.result).toBe(true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(keyup('.input', 'Numpad6')).toBeInstanceOf(Interactor);
    });

    it('eventually triggers the event', async () => {
      let test = testDOMEvent('.input', 'keyup');
      await expect(keyup('.input', 'Numpad9')).resolves.toBeUndefined();
      expect(test.result).toBe(true);
    });
  });
});
