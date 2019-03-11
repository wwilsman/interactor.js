import expect from 'expect';

import { injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import value from '../../src/properties/value';

describe('Interactor assertions - value', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input value="hello world"/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let input = new Interactor('input').timeout(50);

    it('resolves when passing', async () => {
      await expect(input.assert.value('hello world')).resolves.toBeUndefined();
      await expect(input.assert.not.value('HELLO')).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(input.assert.value('hallo worldo'))
        .rejects.toThrow('value is "hello world" not "hallo worldo"');
      await expect(input.assert.not.value('hello world'))
        .rejects.toThrow('value is "hello world"');
    });
  });

  describe('with a custom property', () => {
    @Interactor.extend class FieldInteractor {
      static defaultScope = 'fieldset';
      value = value('input');
    }

    let field = new FieldInteractor().timeout(50);

    it('resolves when passing', async () => {
      await expect(field.assert.value('hello world')).resolves.toBeUndefined();
      await expect(field.assert.not.value('HELLO')).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(field.assert.value('hallo worldo'))
        .rejects.toThrow('value is "hello world" not "hallo worldo"');
      await expect(field.assert.not.value('hello world'))
        .rejects.toThrow('value is "hello world"');
    });
  });
});
