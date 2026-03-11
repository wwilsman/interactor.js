import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #within(selector)', () => {
  beforeEach(() => {
    fixture(`
      <p class="foobar">
        <span>Foo</span>
        <span>Bar</span>
      </p>
      <p class="baz">
        <p>Baz</p>
      </p>
    `);
  });

  it('asserts that the element is within another element', async () => {
    await I.find('Foo').within('.foobar');
    await I.find('Bar').within('.foobar');

    await assert.throws(
      I.find('Baz').within('.foobar'),
      `"Baz" is not within '.foobar'`);
  });

  it('can assert that the element is not within another element', async () => {
    await I.find('Baz').not.within('.foobar');
    await I.find('Foo').not.within('.baz');

    await assert.throws(
      I.find('Bar').not.within('.foobar'),
      `"Bar" is within '.foobar'`);
  });

  it('supports test attribute selector syntax', async () => {
    fixture(`
      <div data-test="container">
        <p>Content</p>
      </div>
      <div data-test-wrapper>
        <p>Other</p>
      </div>
    `);

    await I.find('Content').within('::(container)');
    await I.find('Other').within('::wrapper');

    await assert.throws(I.find('Content').within('::container'),
      `"Content" is not within '::container'`);
    await assert.throws(I.find('Other').within('::(wrapper)'),
      `"Other" is not within '::(wrapper)'`);
  });
});
