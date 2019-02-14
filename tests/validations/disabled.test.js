import expect from 'expect';

import { $, injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import disabled from '../../src/validations/disabled';

describe('Interactor validations - disabled', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input disabled/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    it('returns true when the element is disabled', () => {
      expect(new Interactor('input')).toHaveProperty('disabled', true);
    });

    it('returns false when the element is not disabled', () => {
      $('input').disabled = false;
      expect(new Interactor('input')).toHaveProperty('disabled', false);
    });

    describe('using validate', () => {
      let input = new Interactor('input').timeout(50);

      it('resolves when passing', async () => {
        await expect(input.validate('disabled')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        $('input').disabled = false;
        await expect(input.validate('disabled')).rejects.toThrow('not disabled');
      });
    });
  });

  describe('with the validation creator', () => {
    @Interactor.extend class FieldInteractor {
      static defaultScope = 'fieldset';
      disabled = disabled('input');
    }

    it('returns true when the specified element is disabled', () => {
      expect(new FieldInteractor()).toHaveProperty('disabled', true);
    });

    it('returns false when the element is not disabled', () => {
      $('input').disabled = false;
      expect(new FieldInteractor()).toHaveProperty('disabled', false);
    });

    describe('using validate', () => {
      let field = new FieldInteractor().timeout(50);

      it('resolves when passing', async () => {
        await expect(field.validate('disabled')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        $('input').disabled = false;
        await expect(field.validate('disabled')).rejects.toThrow('not disabled');
      });
    });
  });
});
