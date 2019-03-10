import expect from 'expect';

import { injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import focused from '../../src/properties/focused';

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
  });
});
