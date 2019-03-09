import expect from 'expect';

import { injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import exists from '../../src/properties/exists';

describe('Interactor properties - exists', () => {
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
  });

  describe('with the property creator', () => {
    @Interactor.extend class DivInteractor {
      static defaultScope = '.exists';
      exists = exists('.not-exists');
      reallyExists = exists();
    }

    let div = new DivInteractor();

    it('returns true when the element exists', () => {
      expect(div).toHaveProperty('reallyExists', true);
    });

    it('returns false when the element does not exist', () => {
      expect(div).toHaveProperty('exists', false);
    });
  });
});
