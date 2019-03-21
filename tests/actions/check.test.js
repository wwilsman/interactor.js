import expect from 'expect';

import { injectHtml, testDOMEvent } from '../helpers';
import { Interactor, check, uncheck } from 'interactor.js';

describe('Interactor actions - check / uncheck', () => {
  beforeEach(() => {
    injectHtml(`
      <input class="input"/>
      <input class="checkbox" type="checkbox"/>
      <fieldset class="radiogroup">
        <input class="radio-1" name="group" type="radio"/>
        <input class="radio-2" name="group" type="radio" checked="true"/>
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
      let input = testDOMEvent('.checkbox', 'input');
      let change = testDOMEvent('.checkbox', 'change');

      let checkbox = new Interactor('.checkbox');
      await expect(checkbox.check()).resolves.toBeUndefined();

      expect(checkbox.$element.checked).toBe(true);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });

    it('eventually unchecks the element', async () => {
      let input = testDOMEvent('.checkbox', 'input');
      let change = testDOMEvent('.checkbox', 'change');

      let checkbox = new Interactor('.checkbox');
      checkbox.$element.checked = true;
      await expect(checkbox.uncheck()).resolves.toBeUndefined();

      expect(checkbox.$element.checked).toBe(false);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });

    it('eventually checks a nested element', async () => {
      let input = testDOMEvent('.radio-1', 'input');
      let change = testDOMEvent('.radio-1', 'change');

      let group = new Interactor('.radiogroup');
      expect(group.$('.radio-1').checked).toBe(false);
      expect(group.$('.radio-2').checked).toBe(true);
      await expect(group.check('.radio-1')).resolves.toBeUndefined();

      expect(group.$('.radio-1').checked).toBe(true);
      expect(group.$('.radio-2').checked).toBe(false);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });

    it('eventually throws an error when (un)checking a non-input element', async () => {
      let group = new Interactor('.radiogroup').timeout(50);

      await expect(group.check()).rejects
        .toThrow('Failed to check ".radiogroup": not an input element');
      await expect(group.uncheck()).rejects
        .toThrow('Failed to uncheck ".radiogroup": not an input element');
    });

    it('eventually throws an error when (un)checking a non-checkable element', async () => {
      let input = new Interactor('.input').timeout(50);

      await expect(input.check()).rejects
        .toThrow('Failed to check ".input": not a checkbox or radio button');
      await expect(input.uncheck()).rejects
        .toThrow('Failed to uncheck ".input": not a checkbox or radio button');
    });

    it('eventually throws an error when (un)checking a disabled element', async () => {
      let checkbox = new Interactor('.checkbox').timeout(50);
      checkbox.$element.disabled = true;

      await expect(checkbox.check()).rejects
        .toThrow('Failed to check ".checkbox": disabled');
      expect(checkbox.$element.checked).toBe(false);

      checkbox.$element.checked = true;
      await expect(checkbox.uncheck()).rejects
        .toThrow('Failed to uncheck ".checkbox": disabled');
      expect(checkbox.$element.checked).toBe(true);
    });
  });

  describe('with the action creator', () => {
    @Interactor.extend class RadioGroupInteractor {
      static defaultScope = '.radiogroup';

      check1 = check('.radio-1');
      check2 = check('.radio-2').assert(element => {
        expect(element.checked).toBe(true);
      });

      uncheck2 = uncheck('.radio-2');
      uncheck1 = uncheck('.radio-1').assert(element => {
        expect(element.checked).toBe(false);
      });
    }

    let group = new RadioGroupInteractor();

    it('checks the specified element', async () => {
      let test = testDOMEvent('.radio-1', 'change');
      await expect(group.check1()).resolves.toBeUndefined();
      expect(test.$element.checked).toBe(true);
      expect(test.result).toBe(true);
    });

    it('unchecks the specified element', async () => {
      let test = testDOMEvent('.radio-2', 'change');
      await expect(group.uncheck2()).resolves.toBeUndefined();
      expect(test.$element.checked).toBe(false);
      expect(test.result).toBe(true);
    });

    it('can chain other interactor methods', async () => {
      let test1 = testDOMEvent('.radio-1', 'change');
      let test2 = testDOMEvent('.radio-2', 'change');

      await expect(group.uncheck1()).resolves.toBeUndefined();
      expect(test1.$element.checked).toBe(false);
      expect(test1.result).toBe(true);

      await expect(group.check2()).resolves.toBeUndefined();
      expect(test2.$element.checked).toBe(true);
      expect(test2.result).toBe(true);
    });
  });

  describe('using the action directly', () => {
    it('returns an interactor', () => {
      expect(check('.checkbox')).toBeInstanceOf(Interactor);
      expect(uncheck('.checkbox')).toBeInstanceOf(Interactor);
    });

    it('eventually checks the element', async () => {
      let input = testDOMEvent('.checkbox', 'input');
      let change = testDOMEvent('.checkbox', 'change');

      await expect(check('.checkbox')).resolves.toBeUndefined();

      expect(input.$element.checked).toBe(true);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });

    it('eventually unchecks the element', async () => {
      let input = testDOMEvent('.checkbox', 'input');
      let change = testDOMEvent('.checkbox', 'change');

      input.$element.checked = true;
      await expect(uncheck('.checkbox')).resolves.toBeUndefined();

      expect(input.$element.checked).toBe(false);
      expect(input.result).toBe(true);
      expect(change.result).toBe(true);
    });
  });
});
