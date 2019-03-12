import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor, focused } from 'interactor.js';

describe('Interactor properties - focused', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let input = new Interactor('input');

    it('returns true when the element has focus', () => {
      input.$element.focus();
      expect(input).toHaveProperty('focused', true);
    });

    it('returns false when the element does not have focus', () => {
      expect(input).toHaveProperty('focused', false);
    });
  });

  describe('with the property creator', () => {
    @Interactor.extend class FieldInteractor {
      static defaultScope = 'fieldset';
      focused = focused('input');
    }

    let field = new FieldInteractor();

    it('returns true when the specified element has focus', () => {
      field.$('input').focus();
      expect(field).toHaveProperty('focused', true);
    });

    it('returns false when the element does not have focus', () => {
      expect(field).toHaveProperty('focused', false);
    });
  });
});
