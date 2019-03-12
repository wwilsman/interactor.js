import expect from 'expect';

import { injectHtml } from '../helpers';

import {
  Interactor,
  scrollable,
  scrollableX,
  scrollableY
} from 'interactor.js';

describe('Interactor assertions - scrollable', () => {
  beforeEach(() => {
    injectHtml(`
      <div id="container" style="width:100px;height:100px;">
        <div id="content" style="width:1000px;height:1000px;"></div>
      </div>
    `);
  });

  describe('with the default property', () => {
    let container = new Interactor('#container').timeout(50);
    let content = new Interactor('#content').timeout(50);

    it('resolves when passing', async () => {
      await expect(container.assert.scrollableX()).resolves.toBeUndefined();
      await expect(container.assert.scrollableY()).resolves.toBeUndefined();
      await expect(container.assert.scrollable()).resolves.toBeUndefined();
      await expect(content.assert.not.scrollableX()).resolves.toBeUndefined();
      await expect(content.assert.not.scrollableY()).resolves.toBeUndefined();
      await expect(content.assert.not.scrollable()).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(container.assert.not.scrollableX()).rejects.toThrow('has overflow-x');
      await expect(container.assert.not.scrollableY()).rejects.toThrow('has overflow-y');
      await expect(container.assert.not.scrollable()).rejects.toThrow('has overflow');
      await expect(content.assert.scrollableX()).rejects.toThrow('no overflow-x');
      await expect(content.assert.scrollableY()).rejects.toThrow('no overflow-y');
      await expect(content.assert.scrollable()).rejects.toThrow('no overflow');
    });
  });

  describe('with a custom property', () => {
    @Interactor.extend class ContainerInteractor {
      static defaultScope = '#container';
      scrollableX = scrollableX('#content');
      scrollableY = scrollableY('#content');
      scrollable = scrollable('#content');
    }

    let container = new ContainerInteractor().timeout(50);

    it('resolves when passing', async () => {
      await expect(container.assert.not.scrollableX()).resolves.toBeUndefined();
      await expect(container.assert.not.scrollableY()).resolves.toBeUndefined();
      await expect(container.assert.not.scrollable()).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(container.assert.scrollableX()).rejects.toThrow('no overflow-x');
      await expect(container.assert.scrollableY()).rejects.toThrow('no overflow-y');
      await expect(container.assert.scrollable()).rejects.toThrow('no overflow');
    });
  });
});
