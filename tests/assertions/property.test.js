import expect from 'expect';

import { injectHtml, mockConsole, toggleLayoutEngineWarning } from '../helpers';
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

    describe.jsdom('without a layout engine', () => {
      let logs = mockConsole('warn');
      toggleLayoutEngineWarning();

      [ 'clientTop',
        'clientLeft',
        'clientWidth',
        'clientHeight',
        'scrollTop',
        'scrollLeft',
        'scrollWidth',
        'scrollHeight'
      ].forEach(prop => {
        it(`warns about the missing layout engine for \`${prop}\``, async () => {
          await test.assert.property(prop, 0);

          expect(logs[0][0]).toBe(
            'No layout engine detected. ' +
              `Properties effected by the result of CSS cannot be calculated (${prop}). ` +
              'You can disable this warning by setting `Interactor.suppressLayoutEngineWarning = true`.'
          );
        });
      });

      it('does not warn about the missing layout engine for other properties', async () => {
        await test.assert.property('className', '');
        expect(logs).toHaveLength(0);
      });
    });
  });
});
