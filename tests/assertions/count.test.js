import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor } from 'interactor.js';

describe('Interactor assertions - count', () => {
  beforeEach(() => {
    injectHtml(`
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </ul>
    `);
  });

  describe('with the default method', () => {
    let ul = new Interactor('ul').timeout(50);

    it('resolves when passing', async () => {
      await expect(ul.assert.count('li', 3)).resolves.toBeUndefined();
      await expect(ul.assert.not.count('li', 10)).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(ul.assert.count('li', 5))
        .rejects.toThrow('found 3 "li" elements but expected 5');
      await expect(ul.assert.not.count('li', 3))
        .rejects.toThrow('found 3 "li" elements');
    });
  });
});
