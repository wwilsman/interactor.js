import expect from 'expect';

import { injectHtml, testDOMEvent, skipForJsdom } from '../helpers';
import interactor, { Interactor, scroll } from 'interactor.js';

describe('Interactor actions - scroll', () => {
  beforeEach(() => {
    injectHtml(`
      <div id="container" style="width:100px;height:100px;overflow:scroll;">
        <div id="content" style="width:1000px;height:1000px;"></div>
      </div>
    `);
  });

  describe('with the default method', () => {
    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('scroll', expect.any(Function));
      expect(new Interactor().scroll({ top: 0 })).toBeInstanceOf(Interactor);
    });

    it('eventually scrolls the element top', async () => {
      let test = testDOMEvent('#container', 'scroll');
      await new Interactor('#container').scroll({ top: 10 });
      expect(test.result).toBe(true);
      expect(test.$element.scrollTop).toBe(10);
      expect(test.$element.scrollLeft).toBe(0);
    });

    it('eventually scrolls the element left', async () => {
      let test = testDOMEvent('#container', 'scroll');
      await new Interactor('#container').scroll({ left: 10 });
      expect(test.result).toBe(true);
      expect(test.$element.scrollTop).toBe(0);
      expect(test.$element.scrollLeft).toBe(10);
    });

    it('eventually scrolls the element top and left', async () => {
      let test = testDOMEvent('#container', 'scroll');
      await new Interactor('#container').scroll({ top: 10, left: 20 });
      expect(test.result).toBe(true);
      expect(test.$element.scrollTop).toBe(10);
      expect(test.$element.scrollLeft).toBe(20);
    });

    it('can define x or y instead of left or top', async () => {
      let test = testDOMEvent('#container', 'scroll');
      await new Interactor('#container').scroll({ x: 50, y: 25 });
      expect(test.result).toBe(true);
      expect(test.$element.scrollTop).toBe(25);
      expect(test.$element.scrollLeft).toBe(50);
    });

    it('eventually scrolls a nested element', async () => {
      let test = testDOMEvent('#container', 'scroll');
      await new Interactor().scroll('#container', { top: 10, left: 20 });
      expect(test.result).toBe(true);
      expect(test.$element.scrollTop).toBe(10);
      expect(test.$element.scrollLeft).toBe(20);
    });

    it('can fire a wheel event before scrolling', async () => {
      let test = testDOMEvent('#container', 'wheel');
      await new Interactor('#container').scroll({ top: 10, wheel: true });
      expect(test.result).toBe(true);
      expect(test.$element.scrollTop).toBe(10);
    });

    it('does not fire a wheel event by default', async () => {
      let test = testDOMEvent('#container', 'wheel');
      await new Interactor('#container').scroll({ top: 10 });
      expect(test.result).toBe(false);
      expect(test.$element.scrollTop).toBe(10);
    });

    it('can control the frequency of scroll events', async () => {
      let scrollCount = 0;
      let test = testDOMEvent('#container', 'scroll', () => scrollCount++);
      await new Interactor('#container').scroll({ top: 100, frequency: 10 });
      expect(test.result).toBe(true);
      expect(test.$element.scrollTop).toBe(100);
      expect(scrollCount).toBe(10);
    });

    // CSS layout is not supported in jsdom; there is no concept of overflow and everything is scrollable
    it('eventually throws an error when scrolling a non-scrollable element', skipForJsdom(async () => {
      let test = testDOMEvent('#content', 'scroll');
      let content = new Interactor('#content').timeout(50);
      await expect(content.scroll({ top: 10 })).rejects
        .toThrow('Failed to scroll "#content": has no overflow-y');
      await expect(content.scroll({ left: 10 })).rejects
        .toThrow('Failed to scroll "#content": has no overflow-x');
      await expect(content.scroll({ top: 10, left: 10 })).rejects
        .toThrow('Failed to scroll "#content": has no overflow');
      expect(test.result).toBe(false);
      expect(test.$element.scrollTop).toBe(0);
      expect(test.$element.scrollLeft).toBe(0);
    }));

    it('immediately throws an error when no direction is provided', () => {
      let container = new Interactor('#container');
      expect(() => container.scroll()).toThrow('missing scroll direction');
    });
  });

  describe('with the action creator', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = @interactor class {
        static defaultScope = '#container';

        scroll = top => scroll('#content', { top });
        scroll10 = scroll({ top: 10 }).assert(element => {
          expect(element.scrollTop).toEqual(10);
        });
      };
    });

    it('can chain other interactor methods', async () => {
      let test = testDOMEvent('#container', 'scroll');
      await new TestInteractor().scroll10();
      expect(test.result).toBe(true);
    });

    it('scrolls the specified element', async () => {
      let test = testDOMEvent('#content', 'scroll');
      let container = new TestInteractor().timeout(50);

      test.$element.innerHTML = '<div style="height:111%;"></div>';
      test.$element.style.overflow = 'scroll';

      await container.scroll(100);
      expect(test.result).toBe(true);
      expect(test.$element.scrollTop).toBe(100);
    });

    // CSS layout is not supported in jsdom; there is no concept of overflow and everything is scrollable
    it('eventually throws when the specified element is not scrollable', skipForJsdom(async () => {
      let test = testDOMEvent('#content', 'scroll');
      let container = new TestInteractor().timeout(50);
      await expect(container.scroll(10)).rejects.toThrow('no overflow-y');
      expect(test.result).toBe(false);
    }));
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(scroll('#container', { top: 10 })).toBeInstanceOf(Interactor);
    });

    it('eventually scrolls the element', async () => {
      let test = testDOMEvent('#container', 'scroll');
      await scroll('#container', { top: 10 });
      expect(test.result).toBe(true);
      expect(test.$element.scrollTop).toBe(10);
    });
  });
});
