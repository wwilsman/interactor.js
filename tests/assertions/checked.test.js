import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #checked()', () => {
  beforeEach(() => {
    fixture(`
      <label for="check">Foo</label>
      <input id="check" type="checkbox" checked />
      <label for="radio">Bar</label>
      <input id="radio" type="radio" />
    `);
  });

  it('asserts that the element is checked', async () => {
    await I.find('Foo').checked();

    await assert.throws(I.find('Bar').checked(),
      '"Bar" is not checked');
  });

  it('can assert that the element is not checked', async () => {
    await I.find('Bar').not.checked();

    await assert.throws(I.find('Foo').not.checked(),
      '"Foo" is checked');
  });
});
