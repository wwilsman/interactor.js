import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, disabled } from 'interactor.js';

describe('Interactor properties - disabled', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input disabled/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let input = new Interactor('input').timeout(50);

    it('returns true when the element is disabled', () => {
      expect(input).toHaveProperty('disabled', true);
    });

    it('returns false when the element is not disabled', () => {
      input.$element.disabled = false;
      expect(input).toHaveProperty('disabled', false);
    });

    describe('and the default assertion', () => {
      let field = new Interactor('fieldset').timeout(50);

      it('resolves when passing', async () => {
        await expect(input.assert.disabled()).resolves.toBeUndefined();
        input.$element.disabled = false;
        await expect(input.assert.not.disabled()).resolves.toBeUndefined();
      });

      it('resolves when passing with a selector', async () => {
        await expect(field.assert.disabled('input')).resolves.toBeUndefined();
        input.$element.disabled = false;
        await expect(field.assert.not.disabled('input')).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(input.assert.not.disabled()).rejects.toThrow('is disabled');
        input.$element.disabled = false;
        await expect(input.assert.disabled()).rejects.toThrow('is not disabled');
      });

      it('rejects with an error when failing with a selector', async () => {
        await expect(field.assert.not.disabled('input')).rejects.toThrow('"input" is disabled');
        input.$element.disabled = false;
        await expect(field.assert.disabled('input')).rejects.toThrow('"input" is not disabled');
      });
    });
  });

  describe('with the property creator', () => {
    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';
      disabled = disabled('input');
      foo = disabled('input');
    }

    let field = new FieldInteractor().timeout(50);

    it('returns true when the specified element is disabled', () => {
      expect(field).toHaveProperty('disabled', true);
    });

    it('returns false when the specified element is not disabled', () => {
      field.$('input').disabled = false;
      expect(field).toHaveProperty('disabled', false);
    });

    describe('and the default assertion', () => {
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
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(field.assert).toHaveProperty('foo', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(field.assert.foo()).resolves.toBeUndefined();
        field.$('input').disabled = false;
        await expect(field.assert.not.foo()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(field.assert.not.foo()).rejects.toThrow('disabled');
        field.$('input').disabled = false;
        await expect(field.assert.foo()).rejects.toThrow('not disabled');
      });
    });
  });
});
