import expect from 'expect';

import { $, injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import focusable from '../../src/validations/focusable';

describe('Interactor validations - focusable', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <span></span>
        <input/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    it('returns true when the element is focusable', () => {
      expect(new Interactor('input')).toHaveProperty('focusable', true);
    });

    it('returns false when the element is not focusable', () => {
      expect(new Interactor('span')).toHaveProperty('focusable', false);
    });

    it('returns true when the element has a tabindex', () => {
      $('span').tabIndex = 0;
      expect(new Interactor('span')).toHaveProperty('focusable', true);
    });

    describe('using validate', () => {
      it('resolves when passing', async () => {
        let input = new Interactor('input');
        await expect(input.validate('focusable')).resolves.toBe(true);

        $('span').tabIndex = 0;
        let span = new Interactor('span');
        await expect(span.validate('focusable')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        let span = new Interactor('span').timeout(50);
        await expect(span.validate('focusable')).rejects.toThrow('not focusable, tabindex');
      });
    });
  });

  describe('with the validation creator', () => {
    @Interactor.extend class FieldInteractor {
      static defaultScope = 'fieldset';
      focusable = focusable('input');
    }

    it('returns true when the specified element is focusable', () => {
      expect(new FieldInteractor()).toHaveProperty('focusable', true);
    });

    it('returns false when the element is not focusable', () => {
      $('input').tabIndex = -1;
      expect(new FieldInteractor()).toHaveProperty('focusable', false);
    });

    describe('using validate', () => {
      let field = new FieldInteractor().timeout(50);

      it('resolves when passing', async () => {
        await expect(field.validate('focusable')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        $('input').tabIndex = -1;
        await expect(field.validate('focusable')).rejects.toThrow('not focusable, tabindex');
      });
    });
  });
});
