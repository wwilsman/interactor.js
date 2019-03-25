import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, disabled } from 'interactor.js';

describe('Interactor assertions - disabled', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input disabled/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let input = new Interactor('input').timeout(50);

    it('resolves when passing', async () => {
      await expect(input.assert.disabled()).resolves.toBeUndefined();
      input.$element.disabled = false;
      await expect(input.assert.not.disabled()).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(input.assert.not.disabled()).rejects.toThrow('disabled');
      input.$element.disabled = false;
      await expect(input.assert.disabled()).rejects.toThrow('not disabled');
    });

    describe('and a selector', () => {
      let test = new Interactor().timeout(50);

      it('resolves when passing', async () => {
        await expect(test.assert.disabled('input')).resolves.toBeUndefined();
        input.$element.disabled = false;
        await expect(test.assert.not.disabled('input')).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(test.assert.not.disabled('input')).rejects.toThrow('"input" is disabled');
        input.$element.disabled = false;
        await expect(test.assert.disabled('input')).rejects.toThrow('"input" is not disabled');
      });
    });
  });

  describe('with a custom property', () => {
    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';
      disabled = disabled('input');
    }

    let field = new FieldInteractor().timeout(50);

    it('resolves when passing', async () => {
      await expect(field.assert.disabled()).resolves.toBeUndefined();
      field.$('input').disabled = false;
      await expect(field.assert.not.disabled()).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(field.assert.not.disabled()).rejects.toThrow('disabled');
      field.$('input').disabled = false;
      await expect(field.assert.disabled()).rejects.toThrow('not disabled');
    });

    describe('and a selector', () => {
      it('uses the default property', async () => {
        await expect(field.assert.disabled('input')).resolves.toBeUndefined();
        await expect(field.assert.not.disabled('input')).rejects.toThrow('"input" is disabled');
        field.$('input').disabled = false;
        await expect(field.assert.not.disabled('input')).resolves.toBeUndefined();
        await expect(field.assert.disabled('input')).rejects.toThrow('"input" is not disabled');
      });
    });
  });
});
