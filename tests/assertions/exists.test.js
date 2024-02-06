import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #exists()', () => {
  beforeEach(() => {
    fixture('<p>Foo</p>');
  });

  it('asserts that the element exists', async () => {
    await I.find('Foo').exists();

    await assert.throws(I.find('Bar').exists(),
      'Could not find "Bar"');
  });

  it('can assert that the element does not exist', async () => {
    await I.find('Bar').not.exists();

    await assert.throws(I.find('Foo').not.exists(),
      'Found "Foo" but expected not to');
  });
});
