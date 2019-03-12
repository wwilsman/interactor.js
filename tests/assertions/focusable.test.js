import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor, focusable } from 'interactor.js';

describe('Interactor assertions - focusable', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <span></span>
        <input/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
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

  describe('with a custom property', () => {
    @Interactor.extend class FieldInteractor {
      static defaultScope = 'fieldset';
      focusable = focusable('input');
    }

    let field = new FieldInteractor().timeout(50);

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
});
