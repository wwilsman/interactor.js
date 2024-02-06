import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #attribute(name, expected)', () => {
  beforeEach(() => {
    fixture('<div data-foo="bar">Foo</div>');
  });

  it('asserts that the element has an attribute with an expected value', async () => {
    await I.find('Foo').attribute('data-foo', 'bar');

    await assert.throws(
      I.find('Foo').attribute('data-foo', 'baz'),
      '"Foo" `data-foo` attribute is "bar" but expected "baz"');
  });

  it('can assert that the element does not have an attribute with an expected value', async () => {
    await I.find('Foo').not.attribute('data-foo', 'baz');

    await assert.throws(
      I.find('Foo').not.attribute('data-foo', 'bar'),
      '"Foo" `data-foo` attribute is "bar" but expected it not to be');
  });
});
