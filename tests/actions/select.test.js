import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import interactor, { Interactor, select } from 'interactor.js';

describe('Interactor actions - select', () => {
  beforeEach(() => {
    injectHtml(`
      <fieldset>
        <select>
          <option selected disabled value="0">choose</option>
          <option value="1">yes</option>
          <option value="2">no</option>
        </select>
      </fieldset>
    `);
  });

  describe('with the default method', () => {
    let select = new Interactor('select').timeout(50);

    it('can select an option by text', async () => {
      expect(select.$element.value).toBe('0');
      await select.select('yes');
      expect(select.$element.value).toBe('1');
    });

    it('throws an error when selecting non-existant options', async () => {
      await expect(select.select('maybe')).rejects.toThrow('unable to find "maybe"');
    });

    it('throws an error when selecting disabled options', async () => {
      await select.select('yes');
      expect(select.$element.value).toBe('1');
      await expect(select.select('choose')).rejects.toThrow('"choose" is disabled');
      expect(select.$element.value).toBe('1');
    });

    it('throws an error for non-select elements', async () => {
      let option = new Interactor('option').timeout(50);
      await expect(option.select('yes')).rejects.toThrow('not a select element');
    });

    it('can select multiple options for multi selects', async () => {
      select.$element.multiple = true;
      select.$element.value = '';
      await select.select(['yes', 'no']);

      expect(
        [...select.$element.selectedOptions]
          .map($el => $el.text)
      ).toEqual(['yes', 'no']);
    });

    it('throws an error when selecting multiple options on a non-multi select', async () => {
      await expect(select.select(['yes', 'no'])).rejects.toThrow('not a multi select');
    });
  });

  describe('with the action creator', () => {
    let TestInteractor;

    beforeEach(() => {
      TestInteractor = @interactor class {
        static defaultScope = 'fieldset';
        select = option => select('select', option);
        selectYes = select('select', 'yes').assert(element => {
          expect(element.value).toBe('1');
        });
      };
    });

    it('selects the option within the specified select element', async () => {
      let input = testDOMEvent('select', 'input');
      let change = testDOMEvent('select', 'change');
      await new TestInteractor().select('no');
      expect(input.$element.value).toBe('2');
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let input = testDOMEvent('select', 'input');
      let change = testDOMEvent('select', 'change');
      await new TestInteractor().selectYes();
      expect(input.$element.value).toBe('1');
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(select('select', 'yes')).toBeInstanceOf(Interactor);
    });

    it('eventually selects the option', async () => {
      let input = testDOMEvent('select', 'input');
      let change = testDOMEvent('select', 'change');
      await select('select', 'yes');
      expect(input.$element.value).toBe('1');
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });
  });
});
