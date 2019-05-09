import expect from 'expect';

import { injectHtml } from '../helpers';
import { Interactor } from 'interactor.js';

describe('Interactor assertions - property', () => {
  beforeEach(() => {
    injectHtml(`
      <div class="float" style="border:10px solid;"></div>
    `);
  });

  describe('with the default method', () => {
    let div = new Interactor('.float').timeout(50);

    it('resolves when passing', async () => {
      await expect(div.assert.property('clientLeft', 10)).resolves.toBeUndefined();
      await expect(div.assert.not.property('clientLeft', 15)).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(div.assert.property('clientLeft', 15))
        .rejects.toThrow('"clientLeft" is 10 but expected 15');
      await expect(div.assert.not.property('tagName', 'DIV'))
        .rejects.toThrow('"tagName" is "DIV"');
    });
  });
});
