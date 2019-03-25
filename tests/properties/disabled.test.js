import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, disabled } from 'interactor.js';

describe('Interactor properties - disabled', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input disabled/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let input;

    beforeEach(() => {
      input = new Interactor('input');
    });

    it('returns true when the element is disabled', () => {
      expect(input).toHaveProperty('disabled', true);
    });

    it('returns false when the element is not disabled', () => {
      input.$element.disabled = false;
      expect(input).toHaveProperty('disabled', false);
    });
  });

  describe('with the property creator', () => {
    let field;

    @interactor class FieldInteractor {
      static defaultScope = 'fieldset';
      disabled = disabled('input');
    }

    beforeEach(() => {
      field = new FieldInteractor();
    });

    it('returns true when the specified element is disabled', () => {
      expect(field).toHaveProperty('disabled', true);
    });

    it('returns false when the specified element is not disabled', () => {
      field.$('input').disabled = false;
      expect(field).toHaveProperty('disabled', false);
    });
  });
});
