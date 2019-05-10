import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, count } from 'interactor.js';

describe('Interactor properties - count', () => {
  beforeEach(() => {
    injectHtml(`
      <ul>
        <li>1</li>
        <li>2</li>
        <li>3</li>
      </ul>
    `);
  });

  describe('with the default property', () => {
    let ul = new Interactor('ul');

    it('returns the number of found elements', () => {
      expect(ul).toHaveProperty('count', expect.any(Function));
      expect(ul.count('li')).toBe(3);
    });
  });

  describe('with the property creator', () => {
    @interactor class ListInteractor {
      static defaultScope = 'ul';
      itemCount = count('li');
    }

    let ul = new ListInteractor().timeout(50);

    it('returns the number of found elements', () => {
      expect(ul).toHaveProperty('itemCount', 3);
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(ul.assert).toHaveProperty('itemCount', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(ul.assert.itemCount(3)).resolves.toBeUndefined();
        await expect(ul.assert.not.itemCount(10)).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(ul.assert.itemCount(5))
          .rejects.toThrow('found 3 "li" elements but expected 5');
        await expect(ul.assert.not.itemCount(3))
          .rejects.toThrow('found 3 "li" elements');
      });
    });
  });
});
