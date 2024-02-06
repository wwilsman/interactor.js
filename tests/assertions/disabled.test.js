import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #disabled()', () => {
  beforeEach(() => {
    fixture(`
      <button disabled>Foo</button>
      <button>Bar</button>
    `);
  });

  it('asserts that the element is disabled', async () => {
    await I.find('Foo').disabled();

    await assert.throws(I.find('Bar').disabled(),
      '"Bar" is not disabled');
  });

  it('can assert that the element is not disabled', async () => {
    await I.find('Bar').not.disabled();

    await assert.throws(I.find('Foo').not.disabled(),
      '"Foo" is disabled');
  });
});
