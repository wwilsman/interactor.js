import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, checked } from 'interactor.js';

describe('Interactor properties - checked', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input type="radio" checked/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let radio = new Interactor('input').timeout(50);

    it('returns true when the element is checked', () => {
      expect(radio).toHaveProperty('checked', true);
    });

    it('returns false when the element is not checked', () => {
      radio.$element.checked = false;
      expect(radio).toHaveProperty('checked', false);
    });

    describe('and the default assertion', () => {
      let field = new Interactor('fieldset').timeout(50);

      it('resolves when passing', async () => {
        await expect(radio.assert.checked()).resolves.toBeUndefined();
        radio.$element.checked = false;
        await expect(radio.assert.not.checked()).resolves.toBeUndefined();
      });

      it('resolves when passing with a selector', async () => {
        await expect(field.assert.checked('input')).resolves.toBeUndefined();
        radio.$element.checked = false;
        await expect(field.assert.not.checked('input')).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(radio.assert.not.checked()).rejects.toThrow('is checked');
        radio.$element.checked = false;
        await expect(radio.assert.checked()).rejects.toThrow('is not checked');
      });

      it('rejects with an error when failing with a selector', async () => {
        await expect(field.assert.not.checked('input')).rejects.toThrow('"input" is checked');
        radio.$element.checked = false;
        await expect(field.assert.checked('input')).rejects.toThrow('"input" is not checked');
      });
    });
  });

  describe('with the property creator', () => {
    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';
      checked = checked('input');
      foo = checked('input');
    }

    let field = new FieldInteractor().timeout(50);

    it('returns true when the specified element is checked', () => {
      expect(field).toHaveProperty('checked', true);
    });

    it('returns false when the specified element is not checked', () => {
      field.$('input').checked = false;
      expect(field).toHaveProperty('checked', false);
    });

    describe('and the default assertion', () => {
      it('resolves when passing', async () => {
        await expect(field.assert.checked()).resolves.toBeUndefined();
        field.$('input').checked = false;
        await expect(field.assert.not.checked()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(field.assert.not.checked()).rejects.toThrow('checked');
        field.$('input').checked = false;
        await expect(field.assert.checked()).rejects.toThrow('not checked');
      });
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(field.assert).toHaveProperty('foo', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(field.assert.foo()).resolves.toBeUndefined();
        field.$('input').checked = false;
        await expect(field.assert.not.foo()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(field.assert.not.foo()).rejects.toThrow('checked');
        field.$('input').checked = false;
        await expect(field.assert.foo()).rejects.toThrow('not checked');
      });
    });
  });
});
