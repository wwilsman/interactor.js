import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #text(expected)', () => {
  beforeEach(() => {
    fixture('<div class="foo">Foo</div>');
  });

  it('asserts that the current element has the expected text', async () => {
    await I.find('Foo').text('Foo');

    await assert.throws(I.find('Foo').text('Bar'),
      '"Foo" text is "Foo" but expected "Bar"');
  });

  it('can assert that the current element does not have the expected text', async () => {
    await I.find('Foo').not.text('Bar');

    await assert.throws(I.find('Foo').not.text('Foo'),
      '"Foo" text is "Foo" but expected it not to be');
  });
});
