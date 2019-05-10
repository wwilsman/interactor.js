import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import interactor, { Interactor, click } from 'interactor.js';

describe('Interactor actions - click', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="test-div">
        <a href="#"></a>
        <button></button>
      </div>
    `);
  });

  describe('with the default method', () => {
    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('click', expect.any(Function));
      expect(new Interactor().click()).toBeInstanceOf(Interactor);
    });

    it('eventually clicks the element', async () => {
      let test = testDOMEvent('a', 'click');
      await new Interactor('a').click();
      expect(test.result).toBe(true);
    });

    it('eventually clicks a nested element', async () => {
      let test = testDOMEvent('button', 'click');
      await new Interactor().click('button');
      expect(test.result).toBe(true);
    });

    it('eventually throws an error when clicking a disabled element', async () => {
      let test = testDOMEvent('button', 'click');
      let button = new Interactor('button').timeout(50);

      test.$element.disabled = true;
      await expect(button.click()).rejects.toThrow('Failed to click "button": is disabled');
      expect(test.result).toBe(false);
    });
  });

  describe('with the action creator', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = @interactor class {
        static defaultScope = '.test-div';

        click = click('a');
        clickDiv = click();
        clickBtn = click('button').assert(element => {
          expect(element.disabled).toBe(true);
        });
      };
    });

    it('clicks the specified element', async () => {
      let test = testDOMEvent('a', 'click');
      await new TestInteractor().click();
      expect(test.result).toBe(true);
    });

    it('clicks the root element when unspecified', async () => {
      let test = testDOMEvent('.test-div', 'click');
      await new TestInteractor().clickDiv();
      expect(test.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let test = testDOMEvent('button', 'click', () => {
        test.$element.disabled = true;
      });

      await new TestInteractor().clickBtn();
      expect(test.result).toBe(true);
      expect(test.$element.disabled).toBe(true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(click('button')).toBeInstanceOf(Interactor);
    });

    it('eventually clicks the element', async () => {
      let test = testDOMEvent('button', 'click');
      await click('button');
      expect(test.result).toBe(true);
    });
  });
});
