import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, value } from 'interactor.js';

describe('Interactor properties - value', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input value="hello world"/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let input = new Interactor('input').timeout(50);

    it('returns the value of the element', () => {
      expect(input).toHaveProperty('value', 'hello world');
    });

    describe('and the default assertion', () => {
      let field = new Interactor('fieldset').timeout(50);

      it('resolves when passing', async () => {
        await expect(input.assert.value('hello world')).resolves.toBeUndefined();
        await expect(input.assert.value(/world/)).resolves.toBeUndefined();
        await expect(input.assert.not.value('HELLO')).resolves.toBeUndefined();
        await expect(input.assert.not.value(/hi/)).resolves.toBeUndefined();
      });

      it('resolves when passing with a selector', async () => {
        await expect(field.assert.value('input', 'hello world')).resolves.toBeUndefined();
        await expect(field.assert.value('input', /w.r.d/)).resolves.toBeUndefined();
        await expect(field.assert.not.value('input', 'HELLO')).resolves.toBeUndefined();
        await expect(field.assert.not.value('input', /h{2}/)).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(input.assert.value('hallo worldo'))
          .rejects.toThrow('value is "hello world" but expected "hallo worldo"');
        await expect(input.assert.value(/hi/i))
          .rejects.toThrow('value is "hello world" but expected /hi/i');
        await expect(input.assert.not.value('hello world'))
          .rejects.toThrow('value is "hello world"');
        await expect(input.assert.not.value(/world/))
          .rejects.toThrow('value is /world/');
      });

      it('rejects with an error when failing with a selector', async () => {
        await expect(field.assert.value('input', 'hallo worldo'))
          .rejects.toThrow('value is "hello world" but expected "hallo worldo"');
        await expect(field.assert.value('input', /WORLD/))
          .rejects.toThrow('value is "hello world" but expected /WORLD/');
        await expect(field.assert.not.value('input', 'hello world'))
          .rejects.toThrow('value is "hello world"');
        await expect(field.assert.not.value('input', /l{2}/))
          .rejects.toThrow('value is /l{2}/');
      });
    });
  });

  describe('with the property creator', () => {
    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';
      value = value('input');
      foo = value('input');
    }

    let field = new FieldInteractor().timeout(50);

    it('returns the value of the specified element', () => {
      expect(field).toHaveProperty('value', 'hello world');
    });

    describe('and the default assertion', () => {
      it('resolves when passing', async () => {
        await expect(field.assert.value('hello world')).resolves.toBeUndefined();
        await expect(field.assert.value(/world/)).resolves.toBeUndefined();
        await expect(field.assert.not.value('HELLO')).resolves.toBeUndefined();
        await expect(field.assert.not.value(/WORLD/)).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(field.assert.value('hallo worldo'))
          .rejects.toThrow('value is "hello world" but expected "hallo worldo"');
        await expect(field.assert.value(/hallo/))
          .rejects.toThrow('value is "hello world" but expected /hallo/');
        await expect(field.assert.not.value('hello world'))
          .rejects.toThrow('value is "hello world"');
        await expect(field.assert.not.value(/h.llo/))
          .rejects.toThrow('value is /h.llo/');
      });
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(field.assert).toHaveProperty('foo', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(field.assert.foo('hello world')).resolves.toBeUndefined();
        await expect(field.assert.foo(/w.r.d/)).resolves.toBeUndefined();
        await expect(field.assert.not.foo('HELLO')).resolves.toBeUndefined();
        await expect(field.assert.not.foo(/h{2}/)).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(field.assert.foo('hallo worldo'))
          .rejects.toThrow('value is "hello world" but expected "hallo worldo"');
        await expect(field.assert.foo(/ha/))
          .rejects.toThrow('value is "hello world" but expected /ha/');
        await expect(field.assert.not.foo('hello world'))
          .rejects.toThrow('value is "hello world"');
        await expect(field.assert.not.foo(/h.l{2}o/))
          .rejects.toThrow('value is /h.l{2}o/');
      });
    });
  });
});
