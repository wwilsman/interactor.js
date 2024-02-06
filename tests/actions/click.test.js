import { describe, it } from 'moonshiner';
import { I, assert, fixture, listen } from '../helpers';

describe('Actions | #click(selector?)', () => {
  it('clicks the current element', async () => {
    fixture('<button>Foo</button>');
    let event = listen('button', 'click');

    await I.click('Foo');
    await assert(event.calls.length === 1,
      'Expected to click "Foo"');

    await I.find('Foo').then.click();
    await assert(event.calls.length === 2,
      'Expected to click "Foo" a second time');
  });

  it('asserts the element is not disabled', async () => {
    fixture('<button disabled>Bar</button>');
    let event = listen('button', 'click');

    await assert.throws(I.click('Bar'),
      '"Bar" is disabled');
    await assert(event.calls.length === 0,
      'Expected "Bar" to not be clicked');
  });

  it('checks and unchecks checkbox and radio elements', async () => {
    fixture(`
      <input id="check" type="checkbox" />
      <label for="check">Baz</label>
      <input name="radios" id="radio-1" type="radio" />
      <label for="radio-1">Qux</label>
      <input name="radios" id="radio-2" type="radio" />
      <label for="radio-2">Xyzzy</label>
    `);

    await I.click('Baz');
    await assert(document.getElementById('check').checked === true,
      'Expected "Baz" to be checked');

    await I.click('Baz');
    await assert(document.getElementById('check').checked === false,
      'Expected "Baz" to not be checked');

    await I.click('Qux');
    await assert(document.getElementById('radio-1').checked === true,
      'Expected "Qux" to be checked');
    await assert(document.getElementById('radio-2').checked === false,
      'Expected "Xyzzy" to not be checked');

    await I.click('Xyzzy');
    await assert(document.getElementById('radio-1').checked === false,
      'Expected "Qux" to not be checked');
    await assert(document.getElementById('radio-2').checked === true,
      'Expected "Xyzzy" to be checked');
  });

  it('selects options within select elements', async () => {
    fixture(`
      <select>
        <option disabled>Choose</option>
        <option>Foo</option>
        <option>Bar</option>
      </select>
    `);

    let input = listen('select', 'input');
    let change = listen('select', 'change');

    await I.click('Foo');
    await assert(input.$.value === 'Foo',
      'Expected "Foo" to be selected');

    await I.click('Bar');
    await assert(input.$.value === 'Bar',
      'Expected "Bar" to be selected');

    await assert(input.calls.length === 2,
      'Expected input events when selecting options');
    await assert(change.calls.length === 2,
      'Expected change events when selecting options');
  });

  it('asserts the option select element is not disabled', async () => {
    fixture(`
      <select disabled>
        <option disabled>Choose</option>
        <option>Foo</option>
        <option>Bar</option>
      </select>
    `);

    let event = listen('select', 'change');

    await assert.throws(I.click('Foo'),
      '"Foo" select is disabled');
    await assert(event.calls.length === 0,
      'Expected change event not to be triggered');
  });

  it('selects and deselects options within multi-select elements', async () => {
    fixture(`
      <select multiple>
        <option>Foo</option>
        <option>Bar</option>
      </select>
    `);

    let event = listen('select', 'change');

    await I.click('Foo');
    await I.click('Bar');

    await assert(
      event.$.selectedOptions[0].value === 'Foo' &&
      event.$.selectedOptions[1].value === 'Bar',
      'Expected "Foo" and "Bar" to be selected');

    await I.click('Foo');

    await assert(
      event.$.selectedOptions[0].value === 'Bar' &&
      !event.$.selectedOptions[1],
      'Expected only "Bar" to be selected');
  });
});
