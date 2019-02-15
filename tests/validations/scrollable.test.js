import expect from 'expect';

import { $, injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import scrollable, { scrollableX, scrollableY } from '../../src/validations/scrollable';

describe('Interactor validations - scrollable', () => {
  beforeEach(() => {
    injectHtml(`
      <div id="container" style="width:100px;height:100px;">
        <div id="content" style="width:1000px;height:1000px;"></div>
      </div>
    `);
  });

  describe('with the default property', () => {
    it('returns true when the element is scrollable', () => {
      expect(new Interactor('#container')).toHaveProperty('scrollableX', true);
      expect(new Interactor('#container')).toHaveProperty('scrollableY', true);
      expect(new Interactor('#container')).toHaveProperty('scrollable', true);
    });

    it('returns false when the element is not scrollable', () => {
      expect(new Interactor('#content')).toHaveProperty('scrollableX', false);
      expect(new Interactor('#content')).toHaveProperty('scrollableY', false);
      expect(new Interactor('#content')).toHaveProperty('scrollable', false);
    });

    describe('using validate', () => {
      it('resolves when passing', async () => {
        let container = new Interactor('#container');
        await expect(container.validate('scrollableX')).resolves.toBe(true);
        await expect(container.validate('scrollableY')).resolves.toBe(true);
        await expect(container.validate('scrollable')).resolves.toBe(true);
        let content = new Interactor('#content');
        await expect(content.validate('!scrollableX')).resolves.toBe(true);
        await expect(content.validate('!scrollableY')).resolves.toBe(true);
        await expect(content.validate('!scrollable')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        let container = new Interactor('#container').timeout(50);
        await expect(container.validate('!scrollableX')).rejects.toThrow('has overflow-x');
        await expect(container.validate('!scrollableY')).rejects.toThrow('has overflow-y');
        await expect(container.validate('!scrollable')).rejects.toThrow('has overflow');
        let content = new Interactor('#content').timeout(50);
        await expect(content.validate('scrollableX')).rejects.toThrow('no overflow-x');
        await expect(content.validate('scrollableY')).rejects.toThrow('no overflow-y');
        await expect(content.validate('scrollable')).rejects.toThrow('no overflow');
      });
    });
  });

  describe('with the validation creator', () => {
    @Interactor.extend class ContainerInteractor {
      static defaultScope = '#container';
      contentScrollableX = scrollableX('#content');
      contentScrollableY = scrollableY('#content');
      contentScrollable = scrollable('#content');
    }

    it('returns true when the element is scrollable', () => {
      expect(new ContainerInteractor()).toHaveProperty('scrollableX', true);
      expect(new ContainerInteractor()).toHaveProperty('scrollableY', true);
      expect(new ContainerInteractor()).toHaveProperty('scrollable', true);
    });

    it('returns false when the specified element is not scrollable', () => {
      expect(new ContainerInteractor()).toHaveProperty('contentScrollableX', false);
      expect(new ContainerInteractor()).toHaveProperty('contentScrollableY', false);
      expect(new ContainerInteractor()).toHaveProperty('contentScrollable', false);
    });

    describe('using validate', () => {
      let container = new ContainerInteractor().timeout(50);

      it('resolves when passing', async () => {
        await expect(container.validate('scrollableX')).resolves.toBe(true);
        await expect(container.validate('scrollableY')).resolves.toBe(true);
        await expect(container.validate('scrollable')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        await expect(container.validate('contentScrollableX')).rejects.toThrow('no overflow-x');
        await expect(container.validate('contentScrollableY')).rejects.toThrow('no overflow-y');
        await expect(container.validate('contentScrollable')).rejects.toThrow('no overflow');
      });
    });
  });
});
