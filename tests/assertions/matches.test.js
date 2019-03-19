import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor } from 'interactor.js';

describe('Interactor assertions - matches', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="foo bar"></div>
    `);
  });

  describe('with the default method', () => {
    let div = new Interactor('.foo').timeout(50);

    it('resolves when passing', async () => {
      await expect(div.assert.matches('.bar')).resolves.toBeUndefined();
      await expect(div.assert.not.matches('.baz')).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(div.assert.matches('.baz')).rejects.toThrow('is not ".baz"');
      await expect(div.assert.not.matches('.bar')).rejects.toThrow('is ".bar"');
    });

    describe('and a selector', () => {
      let test = new Interactor().timeout(50);

      it('resolves when passing', async () => {
        await expect(test.assert.matches('.foo', '.bar')).resolves.toBeUndefined();
        await expect(test.assert.not.matches('.foo', '.baz')).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(test.assert.matches('.foo', '.baz')).rejects.toThrow('is not ".baz"');
        await expect(test.assert.not.matches('.foo', '.bar')).rejects.toThrow('is ".bar"');
      });
    });
  });
});
