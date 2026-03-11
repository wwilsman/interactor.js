import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #matches(selector)', () => {
  beforeEach(() => {
    fixture('<div class="foo">Foo</div>');
  });

  it('asserts that the current element matches the selector', async () => {
    await I.find('Foo').matches('.foo');

    await assert.throws(I.find('Foo').matches('.bar'),
      `"Foo" does not match '.bar'`);
  });

  it('can assert that the current element does not match the selector', async () => {
    await I.find('Foo').not.matches('.bar');

    await assert.throws(I.find('Foo').not.matches('.foo'),
      `"Foo" matches '.foo'`);
  });

  it('supports test attribute selector syntax', async () => {
    fixture(`
      <div data-test="bar">Bar</div>
      <div data-test-baz>Baz</div>
    `);

    await I.find('Bar').matches('::(bar)');
    await I.find('Baz').matches('::baz');

    await assert.throws(I.find('Bar').matches('::bar'),
      `"Bar" does not match '::bar'`);
    await assert.throws(I.find('Baz').matches('::(baz)'),
      `"Baz" does not match '::(baz)'`);
  });
});
