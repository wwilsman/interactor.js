import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, exists } from 'interactor.js';

describe('Interactor properties - exists', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="exists"></div>
    `);
  });

  describe('with the default property', () => {
    it('returns true when the element exists', () => {
      expect(new Interactor('.exists')).toHaveProperty('exists', true);
    });

    it('returns false when the element does not exist', () => {
      expect(new Interactor('.not-exists')).toHaveProperty('exists', false);
    });

    describe('and the default assertion', () => {
      let div;

      it('resolves when passing', async () => {
        div = new Interactor('.exists');
        await expect(div.assert.exists()).resolves.toBeUndefined();
        div = new Interactor('.not-exists');
        await expect(div.assert.not.exists()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        div = new Interactor('.exists').timeout(50);
        await expect(div.assert.not.exists()).rejects.toThrow('exists');
        div = new Interactor('.not-exists').timeout(50);
        await expect(div.assert.exists()).rejects.toThrow('does not exist');
      });
    });
  });

  describe('with the property creator', () => {
    @interactor class DivInteractor {
      static defaultScope = '.exists';
      exists = exists('.not-exists');
      reallyExists = exists();
    }

    let div = new DivInteractor().timeout(50);

    it('returns true when the element exists', () => {
      expect(div).toHaveProperty('reallyExists', true);
    });

    it('returns false when the element does not exist', () => {
      expect(div).toHaveProperty('exists', false);
    });

    describe('and the default assertion', () => {
      it('resolves when passing', async () => {
        await expect(div.assert.not.exists()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(div.assert.exists()).rejects.toThrow('does not exist');
      });
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(div.assert).toHaveProperty('reallyExists', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(div.assert.reallyExists()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(div.assert.not.reallyExists()).rejects.toThrow('exists');
      });
    });
  });
});
