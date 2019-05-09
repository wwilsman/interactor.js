import expect from 'expect';

import { injectHtml } from '../helpers';

import interactor, {
  Interactor,
  scrollable,
  scrollableX,
  scrollableY
} from 'interactor.js';

describe('Interactor properties - scrollable', () => {
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

    it('returns true when the element is scrollable', () => {
      expect(container).toHaveProperty('scrollableX', true);
      expect(container).toHaveProperty('scrollableY', true);
      expect(container).toHaveProperty('scrollable', true);
    });

    it('returns false when the element is not scrollable', () => {
      expect(content).toHaveProperty('scrollableX', false);
      expect(content).toHaveProperty('scrollableY', false);
      expect(content).toHaveProperty('scrollable', false);
    });

    describe('and the default assertion', () => {
      let test = new Interactor().timeout(50);

      it('resolves when passing', async () => {
        await expect(container.assert.scrollableX()).resolves.toBeUndefined();
        await expect(container.assert.scrollableY()).resolves.toBeUndefined();
        await expect(container.assert.scrollable()).resolves.toBeUndefined();
        await expect(content.assert.not.scrollableX()).resolves.toBeUndefined();
        await expect(content.assert.not.scrollableY()).resolves.toBeUndefined();
        await expect(content.assert.not.scrollable()).resolves.toBeUndefined();
      });

      it('resolves when passing with a selector', async () => {
        await expect(test.assert.scrollableX('#container')).resolves.toBeUndefined();
        await expect(test.assert.scrollableY('#container')).resolves.toBeUndefined();
        await expect(test.assert.scrollable('#container')).resolves.toBeUndefined();
        await expect(test.assert.not.scrollableX('#content')).resolves.toBeUndefined();
        await expect(test.assert.not.scrollableY('#content')).resolves.toBeUndefined();
        await expect(test.assert.not.scrollable('#content')).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(container.assert.not.scrollableX()).rejects.toThrow('has overflow-x');
        await expect(container.assert.not.scrollableY()).rejects.toThrow('has overflow-y');
        await expect(container.assert.not.scrollable()).rejects.toThrow('has overflow');
        await expect(content.assert.scrollableX()).rejects.toThrow('has no overflow-x');
        await expect(content.assert.scrollableY()).rejects.toThrow('has no overflow-y');
        await expect(content.assert.scrollable()).rejects.toThrow('has no overflow');
      });

      it('rejects with an error when failing with a selector', async () => {
        await expect(test.assert.not.scrollableX('#container')).rejects.toThrow('has overflow-x');
        await expect(test.assert.not.scrollableY('#container')).rejects.toThrow('has overflow-y');
        await expect(test.assert.not.scrollable('#container')).rejects.toThrow('has overflow');
        await expect(test.assert.scrollableX('#content')).rejects.toThrow('has no overflow-x');
        await expect(test.assert.scrollableY('#content')).rejects.toThrow('has no overflow-y');
        await expect(test.assert.scrollable('#content')).rejects.toThrow('has no overflow');
      });
    });
  });

  describe('with the property creator', () => {
    @interactor class ContainerInteractor {
      static defaultScope = '#container';
      scrollableX = scrollableX('#content');
      containerScrollableX = scrollableX();
      scrollableY = scrollableY('#content');
      containerScrollableY = scrollableY();
      scrollable = scrollable('#content');
      containerScrollable = scrollable();
    }

    let container = new ContainerInteractor().timeout(50);

    it('returns true when the element is scrollable', () => {
      expect(container).toHaveProperty('containerScrollableX', true);
      expect(container).toHaveProperty('containerScrollableY', true);
      expect(container).toHaveProperty('containerScrollable', true);
    });

    it('returns false when the specified element is not scrollable', () => {
      expect(container).toHaveProperty('scrollableX', false);
      expect(container).toHaveProperty('scrollableY', false);
      expect(container).toHaveProperty('scrollable', false);
    });

    describe('and the default assertion', () => {
      it('resolves when passing', async () => {
        await expect(container.assert.not.scrollableX()).resolves.toBeUndefined();
        await expect(container.assert.not.scrollableY()).resolves.toBeUndefined();
        await expect(container.assert.not.scrollable()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(container.assert.scrollableX()).rejects.toThrow('has no overflow-x');
        await expect(container.assert.scrollableY()).rejects.toThrow('has no overflow-y');
        await expect(container.assert.scrollable()).rejects.toThrow('has no overflow');
      });
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(container.assert).toHaveProperty('containerScrollableX', expect.any(Function));
        expect(container.assert).toHaveProperty('containerScrollableY', expect.any(Function));
        expect(container.assert).toHaveProperty('containerScrollable', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(container.assert.containerScrollableX()).resolves.toBeUndefined();
        await expect(container.assert.containerScrollableY()).resolves.toBeUndefined();
        await expect(container.assert.containerScrollable()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(container.assert.not.containerScrollableX()).rejects.toThrow('has overflow-x');
        await expect(container.assert.not.containerScrollableY()).rejects.toThrow('has overflow-y');
        await expect(container.assert.not.containerScrollable()).rejects.toThrow('has overflow');
      });
    });
  });
});
