import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor, value } from 'interactor.js';

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

    describe('and a selector', () => {
      let test = new Interactor().timeout(50);

      it('resolves when passing', async () => {
        await expect(test.assert.value('input', 'hello world')).resolves.toBeUndefined();
        await expect(test.assert.not.value('input', 'HELLO')).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(test.assert.value('input', 'hallo worldo'))
          .rejects.toThrow('"input" value is "hello world" not "hallo worldo"');
        await expect(test.assert.not.value('input', 'hello world'))
          .rejects.toThrow('"input" value is "hello world"');
      });
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

    describe('and a selector', () => {
      it('uses the default property', async () => {
        await expect(field.assert.value('input', 'hello world')).resolves.toBeUndefined();
        await expect(field.assert.not.value('input', 'HELLO')).resolves.toBeUndefined();
        await expect(field.assert.value('input', 'hallo worldo'))
          .rejects.toThrow('"input" value is "hello world" not "hallo worldo"');
        await expect(field.assert.not.value('input', 'hello world'))
          .rejects.toThrow('"input" value is "hello world"');
      });
    });
  });
});
