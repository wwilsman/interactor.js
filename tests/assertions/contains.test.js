import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #contains(selector)', () => {
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

  it('asserts that the element contains another element', async () => {
    await I.find('$(.foobar)').contains('Foo');
    await I.find('$(.foobar)').contains('Bar');

    await assert.throws(
      I.find('$(.foobar)').contains('Baz'),
      '$(.foobar) does not contain "Baz"');
  });

  it('can assert that the element does not contain another element', async () => {
    await I.find('$(.foobar)').not.contains('Baz');
    await I.find('$(.baz)').not.contains('Foo');

    await assert.throws(
      I.find('$(.foobar)').not.contains('Bar'),
      '$(.foobar) contains "Bar"');
  });
});
