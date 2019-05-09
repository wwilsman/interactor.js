import expect from 'expect';

import { $, injectHtml } from '../helpers';
import interactor, { Interactor, focusable } from 'interactor.js';

describe('Interactor properties - focusable', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <span></span>
        <input/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    it('returns true when the element is focusable', () => {
      expect(new Interactor('input')).toHaveProperty('focusable', true);
    });

    it('returns false when the element is not focusable', () => {
      expect(new Interactor('span')).toHaveProperty('focusable', false);
    });

    it('returns true when the element has a tabindex', () => {
      $('span').tabIndex = 0;
      expect(new Interactor('span')).toHaveProperty('focusable', true);
    });

    describe('and the default assertion', () => {
      let input = new Interactor('input').timeout(50);
      let span = new Interactor('span').timeout(50);

      it('resolves when passing', async () => {
        await expect(input.assert.focusable()).resolves.toBeUndefined();
        input.$element.tabIndex = -1;
        await expect(input.assert.not.focusable()).resolves.toBeUndefined();

        await expect(span.assert.not.focusable()).resolves.toBeUndefined();
        span.$element.tabIndex = 0;
        await expect(span.assert.focusable()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(input.assert.not.focusable()).rejects.toThrow('focusable');
        input.$element.tabIndex = -1;
        await expect(input.assert.focusable()).rejects.toThrow('not focusable, tabindex');

        await expect(span.assert.focusable()).rejects.toThrow('not focusable, tabindex');
        span.$element.tabIndex = 0;
        await expect(span.assert.not.focusable()).rejects.toThrow('focusable');
      });
    });
  });

  describe('with the property creator', () => {
    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';
      focusable = focusable('input');
      foo = focusable('input');
    }

    let field = new FieldInteractor().timeout(50);

    it('returns true when the specified element is focusable', () => {
      expect(field).toHaveProperty('focusable', true);
    });

    it('returns false when the specified element is not focusable', () => {
      $('input').tabIndex = -1;
      expect(field).toHaveProperty('focusable', false);
    });

    describe('and the default assertion', () => {
      it('resolves when passing', async () => {
        await expect(field.assert.focusable()).resolves.toBeUndefined();
        field.$('input').tabIndex = -1;
        await expect(field.assert.not.focusable()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(field.assert.not.focusable()).rejects.toThrow('focusable');
        field.$('input').tabIndex = -1;
        await expect(field.assert.focusable()).rejects.toThrow('not focusable, tabindex');
      });
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(field.assert).toHaveProperty('foo', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(field.assert.foo()).resolves.toBeUndefined();
        field.$('input').tabIndex = -1;
        await expect(field.assert.not.foo()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(field.assert.not.foo()).rejects.toThrow('focusable');
        field.$('input').tabIndex = -1;
        await expect(field.assert.foo()).rejects.toThrow('not focusable, tabindex');
      });
    });
  });
});
