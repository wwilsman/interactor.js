import expect from 'expect';

import { $, injectHtml, testDOMEvent } from '../helpers';
import Interactor from '../../src/interactor';
import focus from '../../src/actions/focus';

describe('Interactor actions - focus', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <span></span>
        <input/>
      </fieldset>
    `);
  });

  describe('with the default method', () => {
    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('focus', expect.any(Function));
      expect(new Interactor().focus()).toBeInstanceOf(Interactor);
    });

    it('eventually focuses the element', async () => {
      let test = testDOMEvent('input', 'focus');
      await new Interactor('input').focus();
      expect(test.result).toBe(true);
    });

    it('eventually focuses a nested element', async () => {
      let test = testDOMEvent('input', 'focus');
      await new Interactor().focus('input');
      expect(test.result).toBe(true);
    });

    it('eventually throws an error when focusing a non-focusable element', async () => {
      let test = testDOMEvent('span', 'focus');
      let input = new Interactor('span').timeout(50);
      await expect(input.focus()).rejects.toThrow('Failed to focus "span": not focusable');
      expect(test.result).toBe(false);
    });
  });

  describe('with the action creator', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = @Interactor.extend class {
        static defaultScope = 'fieldset';

        focus = focus('input');
        focusField = focus();
        focusInput = focus('input').validate(function() {
          expect(this.$element).toBe(document.activeElement);
        });
      };
    });

    it('focuses the specified element', async () => {
      let test = testDOMEvent('input', 'focus');
      await new TestInteractor().focus();
      expect(test.result).toBe(true);
    });

    it('focuses the root element when unspecified', async () => {
      let test = testDOMEvent('fieldset', 'focus');
      $('fieldset').tabIndex = 0;
      await new TestInteractor().focusField();
      expect(test.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let test = testDOMEvent('input', 'focus');
      await new TestInteractor().focusInput();
      expect(test.result).toBe(true);
      expect($('input')).toBe(document.activeElement);
    });
  });
});