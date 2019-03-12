import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor, matches } from 'interactor.js';

describe('Interactor properties - matches', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="foo">
        <span class="bar"></span>
      </div>
    `);
  });

  describe('with the default property', () => {
    let div = new Interactor('.foo');

    it('returns true or false when the element matches or not', () => {
      expect(div).toHaveProperty('matches', expect.any(Function));
      expect(div.matches('div.foo')).toBe(true);
      expect(div.matches('span.bar')).toBe(false);
    });

    it('returns true or false when the specified element matches or not', () => {
      expect(div.matches('span', 'div.foo')).toBe(false);
      expect(div.matches('span', 'span.bar')).toBe(true);
    });
  });

  describe('with the property creator', () => {
    @Interactor.extend class DivInteractor {
      static defaultScope = '.foo';
      isFoo = matches('div.foo');
      isBar = matches('span', 'span.bar');
    }

    let div = new DivInteractor();

    it('returns true when matching', () => {
      expect(div).toHaveProperty('isFoo', true);
    });

    it('returns true when the specified element matches', () => {
      expect(div).toHaveProperty('isBar', true);
    });
  });
});
