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
    let test = new Interactor().timeout(50);

    it('resolves when passing', async () => {
      await expect(div.assert.property('clientLeft', 10)).resolves.toBeUndefined();
      await expect(div.assert.not.property('clientLeft', 15)).resolves.toBeUndefined();
    });

    it('resolves when passing with a selector', async () => {
      await expect(test.assert.property('.float', 'clientLeft', 10)).resolves.toBeUndefined();
      await expect(test.assert.not.property('.float', 'clientLeft', 15)).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(div.assert.property('clientLeft', 15))
        .rejects.toThrow('"clientLeft" is 10 but expected 15');
      await expect(div.assert.not.property('tagName', 'DIV'))
        .rejects.toThrow('"tagName" is "DIV"');
    });

    it('rejects with an error when failing with a selector', async () => {
      await expect(test.assert.property('.float', 'clientLeft', 15))
        .rejects.toThrow('".float" "clientLeft" is 10 but expected 15');
      await expect(test.assert.not.property('.float', 'tagName', 'DIV'))
        .rejects.toThrow('".float" "tagName" is "DIV"');
    });
  });
});
