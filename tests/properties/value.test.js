import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor, value } from 'interactor.js';

describe('Interactor properties - value', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <input value="hello world"/>
      </fieldset>
    `);
  });

  describe('with the default property', () => {
    let input = new Interactor('input');

    it('returns the value of the element', () => {
      expect(input).toHaveProperty('value', 'hello world');
    });
  });

  describe('with the property creator', () => {
    @Interactor.extend class FieldInteractor {
      static defaultScope = 'fieldset';
      value = value('input');
    }

    let field = new FieldInteractor();

    it('returns the value of the specified element', () => {
      expect(field).toHaveProperty('value', 'hello world');
    });
  });
});
