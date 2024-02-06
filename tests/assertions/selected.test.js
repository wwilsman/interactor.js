import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #selected()', () => {
  beforeEach(() => {
    fixture(`
      <select>
        <option selected>Foo</option>
        <option>Bar</option>
      </select>
    `);
  });

  it('asserts that the element is selected', async () => {
    await I.find('Foo').selected();

    await assert.throws(I.find('Bar').selected(),
      '"Bar" is not selected');
  });

  it('can assert that the element is not selected', async () => {
    await I.find('Bar').not.selected();

    await assert.throws(I.find('Foo').not.selected(),
      '"Foo" is selected');
  });
});
