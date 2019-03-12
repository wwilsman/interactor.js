import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor, text } from 'interactor.js';

describe('Interactor properties - text', () => {
  beforeEach(() => {
    injectHtml(`
      <p>
        Hello <span style="text-transform:uppercase">world</span>!
      </p>
    `);
  });

  describe('with the default property', () => {
    let p = new Interactor('p');

    it('returns the styled inner text', () => {
      expect(p).toHaveProperty('text', 'Hello WORLD!');
    });
  });

  describe('with the property creator', () => {
    @Interactor.extend class ParagraphInteractor {
      static defaultScope = 'p';
      text = text('span');
    }

    let p = new ParagraphInteractor();

    it('returns the inner text of the specified element', () => {
      expect(p).toHaveProperty('text', 'WORLD');
    });
  });
});
