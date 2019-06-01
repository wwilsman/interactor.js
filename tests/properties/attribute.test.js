import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { Interactor, attribute } from 'interactor.js';

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
    @interactor class DivInteractor {
      static defaultScope = '.foobar';
      foo = attribute('data-foo');
      bar = attribute('span', 'data-bar');
    }

    let div = new DivInteractor().timeout(50);

    it('returns the value of the specified attribute', () => {
      expect(div).toHaveProperty('foo', 'bar');
    });

    it('returns the value of the specified element attribute', () => {
      expect(div).toHaveProperty('bar', 'baz');
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(div.assert).toHaveProperty('foo', expect.any(Function));
        expect(div.assert).toHaveProperty('bar', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(div.assert.foo('bar')).resolves.toBeUndefined();
        await expect(div.assert.bar('baz')).resolves.toBeUndefined();
        await expect(div.assert.not.foo('baz')).resolves.toBeUndefined();
        await expect(div.assert.not.bar('foo')).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(div.assert.foo('baz'))
          .rejects.toThrow('"data-foo" is "bar" but expected "baz"');
        await expect(div.assert.not.bar('baz'))
          .rejects.toThrow('"data-bar" is "baz"');
      });
    });
  });
});