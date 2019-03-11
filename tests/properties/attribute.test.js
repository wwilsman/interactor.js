import expect from 'expect';

import { injectHtml } from '../helpers';
import Interactor from '../../src/interactor';
import attribute from '../../src/properties/attribute';

describe('Interactor properties - attribute', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="foobar" data-foo="bar">
        <span data-bar="baz"></span>
      </div>
    `);
  });

  describe('with the default property', () => {
    let div = new Interactor('.foobar');

    it('returns the value of the attribute', () => {
      expect(div).toHaveProperty('attribute', expect.any(Function));
      expect(div.attribute('data-foo')).toBe('bar');
    });

    it('returns the value of the attribute of the specified element', () => {
      expect(div.attribute('span', 'data-bar')).toBe('baz');
    });
  });

  describe('with the property creator', () => {
    @Interactor.extend class DivInteractor {
      static defaultScope = '.foobar';
      foo = attribute('data-foo');
      bar = attribute('span', 'data-bar');
    }

    let div = new DivInteractor();

    it('returns the value of the specified attribute', () => {
      expect(div).toHaveProperty('foo', 'bar');
    });

    it('returns the value of the specified element attribute', () => {
      expect(div).toHaveProperty('bar', 'baz');
    });
  });
});
