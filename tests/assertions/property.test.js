import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #property(name, expected)', () => {
  beforeEach(() => {
    fixture('<div data-foo="bar">Foo</div>');
  });

  it('asserts that the element has an property with an expected value', async () => {
    await I.find('Foo').property('dataset.foo', 'bar');

    await assert.throws(
      I.find('Foo').property('dataset.foo', 'baz'),
      '"Foo" `dataset.foo` is `bar` but expected `baz`');
  });

  it('can assert that the element does not have an property with an expected value', async () => {
    await I.find('Foo').not.property('dataset.foo', 'baz');

    await assert.throws(
      I.find('Foo').not.property('dataset.foo', 'bar'),
      '"Foo" `dataset.foo` is `bar` but expected it not to be');
  });
});
