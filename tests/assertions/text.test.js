import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor, text } from 'interactor.js';

describe('Interactor assertions - text', () => {
  beforeEach(() => {
    injectHtml(`
      <p>
        Hello <span style="text-transform:uppercase">world</span>!
      </p>
    `);
  });

  describe('with the default property', () => {
    let p = new Interactor('p').timeout(50);

    it('resolves when passing', async () => {
      await expect(p.assert.text('Hello WORLD!')).resolves.toBeUndefined();
      await expect(p.assert.not.text('WORLD')).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(p.assert.text('hello world'))
        .rejects.toThrow('text is "Hello WORLD!" not "hello world"');
      await expect(p.assert.not.text('Hello WORLD!'))
        .rejects.toThrow('text is "Hello WORLD!"');
    });
  });

  describe('with a custom property', () => {
    @Interactor.extend class ParagraphInteractor {
      static defaultScope = 'p';
      text = text('span');
    }

    let p = new ParagraphInteractor().timeout(50);

    it('resolves when passing', async () => {
      await expect(p.assert.text('WORLD')).resolves.toBeUndefined();
      await expect(p.assert.not.text('Hello')).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(p.assert.text('Hello WORLD!'))
        .rejects.toThrow('text is "WORLD" not "Hello WORLD!"');
      await expect(p.assert.not.text('WORLD'))
        .rejects.toThrow('text is "WORLD"');
    });
  });
});
