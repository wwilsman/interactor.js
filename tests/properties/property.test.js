import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, property } from 'interactor.js';

describe('Interactor properties - property', () => {
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

    let div = new DivInteractor();

    it('returns the value of the specified property', () => {
      expect(div).toHaveProperty('width', 100);
    });

    it('returns the value of the specified element property', () => {
      expect(div).toHaveProperty('childWidth', 50);
    });
  });
});
