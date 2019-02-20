import expect from 'expect';

import { injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import exists from '../../src/validations/exists';

describe('Interactor validations - exists', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="exists"></div>
    `);
  });

  describe('with the default property', () => {
    it('returns true when the element exists', () => {
      expect(new Interactor('.exists')).toHaveProperty('exists', true);
    });

    it('returns false when the element does not exist', () => {
      expect(new Interactor('.not-exists')).toHaveProperty('exists', false);
    });

    describe('using validate', () => {
      it('resolves when passing', async () => {
        let div = new Interactor('.exists');
        await expect(div.validate('exists')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        let div = new Interactor('.not-exists').timeout(50);
        await expect(div.validate('exists')).rejects.toThrow('does not exist');
      });
    });
  });

  describe('with the validation creator', () => {
    @Interactor.extend class DivInteractor {
      static defaultScope = '.exists';
      exists = exists('.not-exists');
      reallyExists = exists();
    }

    it('returns true when the element exists', () => {
      expect(new DivInteractor()).toHaveProperty('reallyExists', true);
    });

    it('returns false when the element does not exist', () => {
      expect(new DivInteractor()).toHaveProperty('exists', false);
    });

    describe('using validate', () => {
      let div = new DivInteractor().timeout(50);

      it('resolves when passing', async () => {
        await expect(div.validate('reallyExists')).resolves.toBe(true);
      });

      it('rejects with an error when failing', async () => {
        await expect(div.validate('exists')).rejects.toThrow('does not exist');
      });
    });
  });
});
