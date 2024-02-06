import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #focused()', () => {
  beforeEach(() => {
    fixture(`
      <button>Foo</button>
      <button>Bar</button>
    `);

    document.querySelector('button').focus();
  });

  it('asserts that the element is focused', async () => {
    await I.find('Foo').focused();

    await assert.throws(I.find('Bar').focused(),
      '"Bar" is not focused');
  });

  it('can assert that the element is not focused', async () => {
    await I.find('Bar').not.focused();

    await assert.throws(I.find('Foo').not.focused(),
      '"Foo" is focused');
  });
});
