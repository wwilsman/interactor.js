import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor } from 'interactor.js';

describe('Interactor assertions - attribute', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="foobar" data-foo="bar"></div>
    `);
  });

  describe('with the default method', () => {
    let div = new Interactor('.foobar').timeout(50);
    let test = new Interactor().timeout(50);

    it('resolves when passing', async () => {
      await expect(div.assert.attribute('data-foo', 'bar')).resolves.toBeUndefined();
      await expect(div.assert.not.attribute('data-bar', 'baz')).resolves.toBeUndefined();
    });

    it('resolves when passing with a selector', async () => {
      await expect(test.assert.attribute('.foobar', 'data-foo', 'bar')).resolves.toBeUndefined();
      await expect(test.assert.not.attribute('.foobar', 'data-bar', 'baz')).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(div.assert.attribute('data-foo', 'baz'))
        .rejects.toThrow('"data-foo" is "bar" but expected "baz"');
      await expect(div.assert.not.attribute('data-foo', 'bar'))
        .rejects.toThrow('"data-foo" is "bar"');
    });

    it('rejects with an error when failing with a selector', async () => {
      await expect(test.assert.attribute('.foobar', 'data-foo', 'baz'))
        .rejects.toThrow('".foobar" "data-foo" is "bar" but expected "baz"');
      await expect(test.assert.not.attribute('.foobar', 'data-foo', 'bar'))
        .rejects.toThrow('".foobar" "data-foo" is "bar"');
    });
  });
});