import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, focused } from 'interactor.js';

describe('Interactor properties - focused', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let input = new Interactor('input').timeout(50);

    it('returns true when the element has focus', () => {
      input.$element.focus();
      expect(input).toHaveProperty('focused', true);
    });

    it('returns false when the element does not have focus', () => {
      expect(input).toHaveProperty('focused', false);
    });

    describe('and the default assertion', () => {
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
    });
  });

  describe('with the property creator', () => {
    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';
      focused = focused('input');
      foo = focused('input');
    }

    let field = new FieldInteractor().timeout(50);

    it('returns true when the specified element has focus', () => {
      field.$('input').focus();
      expect(field).toHaveProperty('focused', true);
    });

    it('returns false when the element does not have focus', () => {
      expect(field).toHaveProperty('focused', false);
    });

    describe('and the default assertion', () => {
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
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(field.assert).toHaveProperty('foo', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(field.assert.not.foo()).resolves.toBeUndefined();
        field.$('input').focus();
        await expect(field.assert.foo()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(field.assert.foo()).rejects.toThrow('not focused');
        field.$('input').focus();
        await expect(field.assert.not.foo()).rejects.toThrow('focused');
      });
    });
  });
});
