import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, property } from 'interactor.js';

// CSS layout is not supported in jsdom, which these specific tests test against
describe.skip.jsdom('Interactor properties - property', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="box" style="width:100px;height:100px">
        <div style="width:50%;height:50%"></div>
      </div>
    `);
  });

  describe('with the default property', () => {
    let div = new Interactor('.box');

    it('returns the value of the property', () => {
      expect(div).toHaveProperty('attribute', expect.any(Function));
      expect(div.property('clientHeight')).toBe(100);
    });

    it('returns the value of the attribute of the specified element', () => {
      expect(div.property('div', 'clientHeight')).toBe(50);
    });
  });

  describe('with the property creator', () => {
    @interactor class DivInteractor {
      static defaultScope = '.box';
      width = property('clientWidth');
      childWidth = property('div', 'clientWidth');
    }

    let div = new DivInteractor().timeout(50);

    it('returns the value of the specified property', () => {
      expect(div).toHaveProperty('width', 100);
    });

    it('returns the value of the specified element property', () => {
      expect(div).toHaveProperty('childWidth', 50);
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(div.assert).toHaveProperty('width', expect.any(Function));
        expect(div.assert).toHaveProperty('childWidth', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(div.assert.width(100)).resolves.toBeUndefined();
        await expect(div.assert.not.width(50)).resolves.toBeUndefined();
        await expect(div.assert.childWidth(50)).resolves.toBeUndefined();
        await expect(div.assert.not.childWidth(100)).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(div.assert.width(50))
          .rejects.toThrow('"clientWidth" is 100 but expected 50');
        await expect(div.assert.not.childWidth(50))
          .rejects.toThrow('"clientWidth" is 50');
      });
    });
  });
});
