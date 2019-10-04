import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import interactor, { Interactor, check, uncheck } from 'interactor.js';

describe('Interactor actions - check / uncheck', () => {
  beforeEach(() => {
    injectHtml(`
      <input class="input"/>
      <input class="checkbox" type="checkbox"/>
      <fieldset class="radiogroup">
        <input class="radio-1" name="group" type="radio"/>
        <input class="radio-2" name="group" type="radio" checked/>
      </fieldset>
    `);
  });

  describe('with the default method', () => {
    it('returns a new interactor instance', () => {
      expect(Interactor.prototype).toHaveProperty('check', expect.any(Function));
      expect(Interactor.prototype).toHaveProperty('uncheck', expect.any(Function));
      expect(new Interactor().check()).toBeInstanceOf(Interactor);
      expect(new Interactor().uncheck()).toBeInstanceOf(Interactor);
    });

    it('eventually checks the element', async () => {
      let click = testDOMEvent('.checkbox', 'click');
      let input = testDOMEvent('.checkbox', 'input');
      let change = testDOMEvent('.checkbox', 'change');

      let checkbox = new Interactor('.checkbox');
      await expect(checkbox.check()).resolves.toBeUndefined();

      expect(checkbox.$element.checked).toBe(true);
      expect(click.result).toBe(true);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });

    it('eventually unchecks the element', async () => {
      let click = testDOMEvent('.checkbox', 'click');
      let input = testDOMEvent('.checkbox', 'input');
      let change = testDOMEvent('.checkbox', 'change');

      let checkbox = new Interactor('.checkbox');
      checkbox.$element.checked = true;
      await expect(checkbox.uncheck()).resolves.toBeUndefined();

      expect(checkbox.$element.checked).toBe(false);
      expect(click.result).toBe(true);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });

    it('eventually checks a nested element', async () => {
      let click = testDOMEvent('.radio-1', 'click');
      let input = testDOMEvent('.radio-1', 'input');
      let change = testDOMEvent('.radio-1', 'change');

      let group = new Interactor('.radiogroup');
      expect(group.$('.radio-1').checked).toBe(false);
      expect(group.$('.radio-2').checked).toBe(true);
      await expect(group.check('.radio-1')).resolves.toBeUndefined();

      expect(group.$('.radio-1').checked).toBe(true);
      expect(group.$('.radio-2').checked).toBe(false);
      expect(click.result).toBe(true);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });

    it('eventually throws an error when (un)checking a non-checkable element', async () => {
      let input = new Interactor('.input').timeout(50);
      let radio = new Interactor('.radio-2').timeout(50);

      await expect(input.check()).rejects
        .toThrow('Failed to check ".input": not a checkbox or radio button');
      await expect(input.uncheck()).rejects
        .toThrow('Failed to uncheck ".input": not a checkbox');
      await expect(radio.uncheck()).rejects
        .toThrow('Failed to uncheck ".radio-2": radio buttons cannot be unchecked');
    });

    it('eventually throws an error when (un)checking a disabled element', async () => {
      let checkbox = new Interactor('.checkbox').timeout(50);
      checkbox.$element.disabled = true;

      await expect(checkbox.check()).rejects
        .toThrow('Failed to check ".checkbox": is disabled');
      expect(checkbox.$element.checked).toBe(false);

      checkbox.$element.checked = true;
      await expect(checkbox.uncheck()).rejects
        .toThrow('Failed to uncheck ".checkbox": is disabled');
      expect(checkbox.$element.checked).toBe(true);
    });

    it('eventually throws an error when (un)checking an (un)checked element', async () => {
      let checkbox = new Interactor('.checkbox').timeout(50);

      await expect(checkbox.uncheck()).rejects
        .toThrow('Failed to uncheck ".checkbox": is not checked');

      checkbox.$element.checked = true;
      await expect(checkbox.check()).rejects
        .toThrow('Failed to check ".checkbox": is checked');
    });
  });

  describe('with the action creator', () => {
    @interactor class CheckInteractor {
      checkRadio = check('.radio-1');
      checkRadioAssert = check('.radio-1').assert(element => {
        expect(element.checked).toBe(true);
      });

      uncheckBox = uncheck('.checkbox');
      uncheckBoxAssert = uncheck('.checkbox').assert(element => {
        expect(element.checked).toBe(false);
      });
    }

    let test = new CheckInteractor();

    it('checks the specified element', async () => {
      let change = testDOMEvent('.radio-1', 'change');
      await expect(test.checkRadio()).resolves.toBeUndefined();
      expect(change.$element.checked).toBe(true);
      expect(change.result).toBe(true);
    });

    it('unchecks the specified element', async () => {
      let change = testDOMEvent('.checkbox', 'change');
      change.$element.checked = true;
      await expect(test.uncheckBox()).resolves.toBeUndefined();
      expect(change.$element.checked).toBe(false);
      expect(change.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let changeRadio = testDOMEvent('.radio-1', 'change');
      let changeBox = testDOMEvent('.checkbox', 'change');

      await expect(test.checkRadio()).resolves.toBeUndefined();
      expect(changeRadio.$element.checked).toBe(true);
      expect(changeRadio.result).toBe(true);

      changeBox.$element.checked = true;
      await expect(test.uncheckBoxAssert()).resolves.toBeUndefined();
      expect(changeBox.$element.checked).toBe(false);
      expect(changeBox.result).toBe(true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(check('.checkbox')).toBeInstanceOf(Interactor);
      expect(uncheck('.checkbox')).toBeInstanceOf(Interactor);
    });

    it('eventually checks the element', async () => {
      let click = testDOMEvent('.checkbox', 'click');
      let input = testDOMEvent('.checkbox', 'input');
      let change = testDOMEvent('.checkbox', 'change');

      await expect(check('.checkbox')).resolves.toBeUndefined();

      expect(input.$element.checked).toBe(true);
      expect(click.result).toBe(true);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });

    it('eventually unchecks the element', async () => {
      let click = testDOMEvent('.checkbox', 'click');
      let input = testDOMEvent('.checkbox', 'input');
      let change = testDOMEvent('.checkbox', 'change');

      input.$element.checked = true;
      await expect(uncheck('.checkbox')).resolves.toBeUndefined();

      expect(input.$element.checked).toBe(false);
      expect(click.result).toBe(true);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });
  });
});
