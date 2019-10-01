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
      await expect(div.assert.property('className', 'float')).resolves.toBeUndefined();
      await expect(div.assert.not.property('className', 'foo')).resolves.toBeUndefined();
    });

    it('resolves when passing with a selector', async () => {
      await expect(test.assert.property('.float', 'className', 'float')).resolves.toBeUndefined();
      await expect(test.assert.not.property('.float', 'className', 'foo')).resolves.toBeUndefined();
    });

    it('rejects with an error when failing', async () => {
      await expect(div.assert.property('className', 'div'))
        .rejects.toThrow('"className" is "float" but expected "div"');
      await expect(div.assert.not.property('tagName', 'DIV'))
        .rejects.toThrow('"tagName" is "DIV"');
    });

    it('rejects with an error when failing with a selector', async () => {
      await expect(test.assert.property('.float', 'className', 'div'))
        .rejects.toThrow('".float" "className" is "float" but expected "div"');
      await expect(test.assert.not.property('.float', 'tagName', 'DIV'))
        .rejects.toThrow('".float" "tagName" is "DIV"');
    });
  });
});
