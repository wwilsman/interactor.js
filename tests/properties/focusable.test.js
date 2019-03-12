import expect from 'expect';

import { $, injectHtml } from '../helpers';
import { Interactor, focusable } from 'interactor.js';

describe('Interactor properties - focusable', () => {
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
  });

  describe('with the property creator', () => {
    let field;

    @Interactor.extend class FieldInteractor {
      static defaultScope = 'fieldset';
      focusable = focusable('input');
    }

    beforeEach(() => {
      field = new FieldInteractor();
    });

    it('returns true when the specified element is focusable', () => {
      expect(field).toHaveProperty('focusable', true);
    });

    it('returns false when the specified element is not focusable', () => {
      $('input').tabIndex = -1;
      expect(field).toHaveProperty('focusable', false);
    });
  });
});
