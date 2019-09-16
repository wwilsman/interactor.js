import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, text } from 'interactor.js';

describe('Interactor properties - text', () => {
  beforeEach(() => {
    injectHtml(`
      <p>
        Hello <span style="text-transform:uppercase">world</span>!
      </p>
    `);
  });

  describe('with the default property', () => {
    let p = new Interactor('p').timeout(50);

    it('returns the styled inner text', () => {
      expect(p).toHaveProperty('text', 'Hello WORLD!');
    });

    describe('and the default assertion', () => {
      it('resolves when passing', async () => {
        await expect(p.assert.text('Hello WORLD!')).resolves.toBeUndefined();
        await expect(p.assert.text(/world/i)).resolves.toBeUndefined();
        await expect(p.assert.not.text('WORLD')).resolves.toBeUndefined();
        await expect(p.assert.not.text(/wild/)).resolves.toBeUndefined();
      });

      it('resolves when passing with a selector', async () => {
        await expect(p.assert.text('span', 'WORLD')).resolves.toBeUndefined();
        await expect(p.assert.text('span', /wo/i)).resolves.toBeUndefined();
        await expect(p.assert.not.text('span', 'Hello WORLD!')).resolves.toBeUndefined();
        await expect(p.assert.not.text('span', /hello/i)).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(p.assert.text('hello world'))
          .rejects.toThrow('text is "Hello WORLD!" but expected "hello world"');
        await expect(p.assert.text(/world/))
          .rejects.toThrow('text is "Hello WORLD!" but expected /world/');
        await expect(p.assert.not.text('Hello WORLD!'))
          .rejects.toThrow('text is "Hello WORLD!"');
        await expect(p.assert.not.text(/world/i))
          .rejects.toThrow('text is /world/i');
      });

      it('rejects with an error when failing with a selector', async () => {
        await expect(p.assert.text('span', 'world'))
          .rejects.toThrow('text is "WORLD" but expected "world"');
        await expect(p.assert.text('span', /world/))
          .rejects.toThrow('text is "WORLD" but expected /world/');
        await expect(p.assert.not.text('span', 'WORLD'))
          .rejects.toThrow('text is "WORLD"');
        await expect(p.assert.not.text('span', /world/i))
          .rejects.toThrow('text is /world/i');
      });
    });
  });

  describe('with the property creator', () => {
    @interactor class ParagraphInteractor {
      static defaultScope = 'p';
      text = text('span');
      foo = text('span');
    }

    let p = new ParagraphInteractor().timeout(50);

    it('returns the inner text of the specified element', () => {
      expect(p).toHaveProperty('text', 'WORLD');
    });

    describe('and the default assertion', () => {
      it('resolves when passing', async () => {
        await expect(p.assert.text('WORLD')).resolves.toBeUndefined();
        await expect(p.assert.text(/world/i)).resolves.toBeUndefined();
        await expect(p.assert.not.text('Hello')).resolves.toBeUndefined();
        await expect(p.assert.not.text(/wo/)).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(p.assert.text('Hello WORLD!'))
          .rejects.toThrow('text is "WORLD" but expected "Hello WORLD!"');
        await expect(p.assert.text(/hello/i))
          .rejects.toThrow('text is "WORLD" but expected /hello/i');
        await expect(p.assert.not.text('WORLD'))
          .rejects.toThrow('text is "WORLD"');
        await expect(p.assert.not.text(/world/i))
          .rejects.toThrow('text is /world/i');
      });
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(p.assert).toHaveProperty('foo', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(p.assert.foo('WORLD')).resolves.toBeUndefined();
        await expect(p.assert.foo(/world/i)).resolves.toBeUndefined();
        await expect(p.assert.not.foo('Hello')).resolves.toBeUndefined();
        await expect(p.assert.not.foo(/wo/)).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(p.assert.foo('Hello WORLD!'))
          .rejects.toThrow('text is "WORLD" but expected "Hello WORLD!"');
        await expect(p.assert.text(/hello/i))
          .rejects.toThrow('text is "WORLD" but expected /hello/i');
        await expect(p.assert.not.foo('WORLD'))
          .rejects.toThrow('text is "WORLD"');
        await expect(p.assert.not.text(/world/i))
          .rejects.toThrow('text is /world/i');
      });
    });
  });
});
