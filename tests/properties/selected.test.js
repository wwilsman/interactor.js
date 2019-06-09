import expect from 'expect';

import { injectHtml } from '../helpers';
import interactor, { scoped, collection, selected } from 'interactor.js';

describe('Interactor properties - selected', () => {
  beforeEach(() => {
    injectHtml(`
      <select>
        <option value="0">First</option>
        <option value="1" selected>Second</option>
      </select>
    `);
  });

  describe('with the default property', () => {
    let select = scoped('select', {
      option: collection('option')
    }).timeout(50);

    it('returns true when the element is selected', () => {
      expect(select.option(1)).toHaveProperty('selected', true);
    });

    it('returns false when the element is not selected', () => {
      expect(select.option(0)).toHaveProperty('selected', false);
    });

    describe('and the default assertion', () => {
      it('resolves when passing', async () => {
        await expect(select.assert.option(1).selected()).resolves.toBeUndefined();
        await expect(select.assert.option(0).not.selected()).resolves.toBeUndefined();
      });

      it('resolves when passing with a selector', async () => {
        await expect(select.assert.selected('[value="1"]')).resolves.toBeUndefined();
        await expect(select.assert.not.selected('[value="0"]')).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(select.assert.option(1).not.selected()).rejects.toThrow('is selected');
        await expect(select.assert.option(0).selected()).rejects.toThrow('is not selected');
      });

      it('rejects with an error when failing with a selector', async () => {
        await expect(select.assert.not.selected('[value="1"]'))
          .rejects.toThrow('"[value="1"]" is selected');
        await expect(select.assert.selected('[value="0"]'))
          .rejects.toThrow('"[value="0"]" is not selected');
      });
    });
  });

  describe('with the property creator', () => {
    @interactor class SelectInteractor {
      static defaultScope = 'select';
      first = selected('[value="0"]');
      second = selected('[value="1"]');
    }

    let select = new SelectInteractor().timeout(50);

    it('returns true when the specified element is selected', () => {
      expect(select).toHaveProperty('second', true);
    });

    it('returns false when the specified element is not selected', () => {
      expect(select).toHaveProperty('first', false);
    });

    describe('and the auto-defined assertion', () => {
      it('has an auto-defined assertion', () => {
        expect(select.assert).toHaveProperty('first', expect.any(Function));
        expect(select.assert).toHaveProperty('second', expect.any(Function));
      });

      it('resolves when passing', async () => {
        await expect(select.assert.second()).resolves.toBeUndefined();
        await expect(select.assert.not.first()).resolves.toBeUndefined();
      });

      it('rejects with an error when failing', async () => {
        await expect(select.assert.not.second()).rejects.toThrow('selected');
        await expect(select.assert.first()).rejects.toThrow('not selected');
      });
    });
  });
});
