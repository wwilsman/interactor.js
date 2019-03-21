import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import { Interactor, blur } from 'interactor.js';

describe('Interactor actions - blur', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input/>
      </fieldset>
    `);
  });

  describe('with the default method', () => {
    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('blur', expect.any(Function));
      expect(new Interactor().blur()).toBeInstanceOf(Interactor);
    });

    it('eventually blurs the element', async () => {
      let test = testDOMEvent('input', 'blur');
      test.$element.focus();

      await new Interactor('input').blur();
      expect(test.result).toBe(true);
    });

    it('eventually blurs a nested element', async () => {
      let test = testDOMEvent('input', 'blur');
      test.$element.focus();

      await new Interactor().blur('input');
      expect(test.result).toBe(true);
    });

    it('eventually throws an error when blurring a non-focused element', async () => {
      let test = testDOMEvent('input', 'blur');
      let input = new Interactor('input').timeout(50);
      await expect(input.blur()).rejects.toThrow('Failed to blur "input": not focused');
      expect(test.result).toBe(false);
    });
  });

  describe('with the action creator', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = @Interactor.extend class {
        static defaultScope = 'fieldset';

        blur = blur('input');
        blurField = blur();
        blurInput = blur('input').assert(element => {
          expect(element).not.toBe(document.activeElement);
        });
      };
    });

    it('blurs the specified element', async () => {
      let test = testDOMEvent('input', 'blur');
      test.$element.focus();

      await new TestInteractor().blur();
      expect(test.result).toBe(true);
    });

    it('blurs the root element when unspecified', async () => {
      let test = testDOMEvent('fieldset', 'blur');
      test.$element.tabIndex = 0;
      test.$element.focus();

      await new TestInteractor().blurField();
      expect(test.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let test = testDOMEvent('input', 'blur');
      test.$element.focus();

      await new TestInteractor().blurInput();
      expect(test.result).toBe(true);
      expect(test.$element).not.toBe(document.activeElement);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(blur('input')).toBeInstanceOf(Interactor);
    });

    it('eventually clicks the element', async () => {
      let test = testDOMEvent('input', 'blur');
      test.$element.focus();

      await blur('input');
      expect(test.result).toBe(true);
    });
  });
});
