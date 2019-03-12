import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor, exists } from 'interactor.js';

describe('Interactor assertions - exists', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="exists"></div>
    `);
  });

  describe('with the default property', () => {
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

  describe('with a custom property', () => {
    @Interactor.extend class DivInteractor {
      static defaultScope = '.exists';
      exists = exists('.not-exists');
    }

    let div = new DivInteractor().timeout(50);

    it('resolves when passing', async () => {
      await expect(div.assert.not.exists()).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(div.assert.exists()).rejects.toThrow('does not exist');
    });
  });
});
