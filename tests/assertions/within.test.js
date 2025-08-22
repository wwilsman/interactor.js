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
});
