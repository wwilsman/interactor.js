import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import Interactor from '../../src/interactor';
import click from '../../src/actions/click';

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

    it('eventually throws an error when clicking a non-clickable element', async () => {
      let test = testDOMEvent('.test-div', 'click');
      let div = new Interactor('.test-div').timeout(50);
      await expect(div.click()).rejects.toThrow('Failed to click ".test-div": not focusable');
      expect(test.result).toBe(false);
    });

    it('eventually throws an error when clicking a disabled element', async () => {
      let test = testDOMEvent('button', 'click');
      let button = new Interactor('button').timeout(50);

      test.$element.disabled = true;
      await expect(button.click()).rejects.toThrow('Failed to click "button": disabled');
      expect(test.result).toBe(false);
    });
  });

  describe('with the action creator', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = @Interactor.extend class {
        static defaultScope = '.test-div';

        click = click('a');
        clickDiv = click();
        clickBtn = click('button').validate(function() {
          expect(this.$element.disabled).toBe(true);
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
      test.$element.tabIndex = 0;
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
