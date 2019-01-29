import expect from 'expect';

import { $, injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import isFocused from '../../src/validations/focused';

describe('Interactor validations - focused', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    it('returns true when the element has focus', () => {
      $('input').focus();
      expect(new Interactor('input')).toHaveProperty('focused', true);
    });

    it('returns false when the element does not have focus', () => {
      expect(new Interactor('input')).toHaveProperty('focused', false);
    });

    describe('using validate', () => {
      it('resolves when passing', async () => {
        $('input').focus();
        let input = new Interactor('input');
        await expect(input.validate('focused')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        let input = new Interactor('input').timeout(50);
        await expect(input.validate('focused')).rejects.toThrow('not focused');
      });
    });
  });

  describe('with the validation creator', () => {
    @Interactor.extend class FieldInteractor {
      static defaultScope = 'fieldset';
      focused = isFocused('input');
    }

    it('returns true when the specified element has focus', () => {
      $('input').focus();
      expect(new FieldInteractor()).toHaveProperty('focused', true);
    });

    it('returns false when the element does not have focus', () => {
      expect(new FieldInteractor()).toHaveProperty('focused', false);
    });

    describe('using validate', () => {
      let field = new FieldInteractor().timeout(50);

      it('resolves when passing', async () => {
        $('input').focus();
        await expect(field.validate('focused')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        await expect(field.validate('focused')).rejects.toThrow('not focused');
      });
    });
  });
});
