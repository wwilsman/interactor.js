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
    let container = new Interactor('#container');
    let content = new Interactor('#content');

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
  });

  describe('with the property creator', () => {
    @interactor class ContainerInteractor {
      static defaultScope = '#container';
      contentScrollableX = scrollableX('#content');
      contentScrollableY = scrollableY('#content');
      contentScrollable = scrollable('#content');
    }

    let container = new ContainerInteractor();

    it('returns true when the element is scrollable', () => {
      expect(container).toHaveProperty('scrollableX', true);
      expect(container).toHaveProperty('scrollableY', true);
      expect(container).toHaveProperty('scrollable', true);
    });

    it('returns false when the specified element is not scrollable', () => {
      expect(container).toHaveProperty('contentScrollableX', false);
      expect(container).toHaveProperty('contentScrollableY', false);
      expect(container).toHaveProperty('contentScrollable', false);
    });
  });
});
