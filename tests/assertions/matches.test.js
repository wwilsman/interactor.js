import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #matches(selector)', () => {
  beforeEach(() => {
    fixture('<div class="foo">Foo</div>');
  });

  it('asserts that the current element matches the selector', async () => {
    await I.find('Foo').matches('.foo');

    await assert.throws(I.find('Foo').matches('.bar'),
      '"Foo" does not match `.bar`');
  });

  it('can assert that the current element does not match the selector', async () => {
    await I.find('Foo').not.matches('.bar');

    await assert.throws(I.find('Foo').not.matches('.foo'),
      '"Foo" matches `.foo`');
  });
});
