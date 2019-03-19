import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor, focused } from 'interactor.js';

describe('Interactor assertions - focused', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let input = new Interactor('input').timeout(50);

    it('resolves when passing', async () => {
      await expect(input.assert.not.focused()).resolves.toBeUndefined();
      input.$element.focus();
      await expect(input.assert.focused()).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(input.assert.focused()).rejects.toThrow('not focused');
      input.$element.focus();
      await expect(input.assert.not.focused()).rejects.toThrow('focused');
    });

    describe('and a selector', () => {
      let test = new Interactor().timeout(50);

      it('resolves when passing', async () => {
        await expect(test.assert.not.focused('input')).resolves.toBeUndefined();
        input.$element.focus();
        await expect(test.assert.focused('input')).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(test.assert.focused('input')).rejects.toThrow('"input" is not focused');
        input.$element.focus();
        await expect(test.assert.not.focused('input')).rejects.toThrow('"input" is focused');
      });
    });
  });

  describe('with a custom property', () => {
    @Interactor.extend class FieldInteractor {
      static defaultScope = 'fieldset';
      focused = focused('input');
    }

    let field = new FieldInteractor().timeout(50);

    it('resolves when passing', async () => {
      await expect(field.assert.not.focused()).resolves.toBeUndefined();
      field.$('input').focus();
      await expect(field.assert.focused()).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(field.assert.focused()).rejects.toThrow('not focused');
      field.$('input').focus();
      await expect(field.assert.not.focused()).rejects.toThrow('focused');
    });

    describe('and a selector', () => {
      it('uses the default property', async () => {
        await expect(field.assert.not.focused('input')).resolves.toBeUndefined();
        await expect(field.assert.focused('input')).rejects.toThrow('"input" is not focused');
        field.$('input').focus();
        await expect(field.assert.focused('input')).resolves.toBeUndefined();
        await expect(field.assert.not.focused('input')).rejects.toThrow('"input" is focused');
      });
    });
  });
});
