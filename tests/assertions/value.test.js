import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #value(expected)', () => {
  beforeEach(() => {
    fixture('<input placeholder="Foo" value="Bar" />');
  });

  it('asserts that the current element has an expected value', async () => {
    await I.find('Foo').value('Bar');

    await assert.throws(I.find('Foo').value('Baz'),
      '"Foo" value is "Bar" but expected "Baz"');
  });

  it('can assert that the current element does not have an expected value', async () => {
    await I.find('Foo').not.value('Baz');

    await assert.throws(I.find('Foo').not.value('Bar'),
      '"Foo" value is "Bar" but expected it not to be');
  });
});
