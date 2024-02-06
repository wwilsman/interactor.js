import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #focusable()', () => {
  beforeEach(() => {
    fixture(`
      <h1 tabindex="0">Foo</h1>
      <input placeholder="Bar" />
      <p>Baz</p>
    `);
  });

  it('asserts that the element is focusable', async () => {
    await I.find('Foo').focusable();
    await I.find('Bar').focusable();

    await assert.throws(I.find('Baz').focusable(),
      '"Baz" is not focusable');
  });

  it('asserts the document is focusable', async () => {
    fixture('<iframe srcdoc="<button>Foo</button>"/>');

    let $f = document.querySelector('iframe');
    $f.focus = () => {};

    let F = new I.constructor({
      assert: { timeout: 100, reliability: 0 },
      root: () => $f.contentDocument.body
    });

    await assert.throws(F.focus('Foo'),
      'The document is not focusable');
  });

  it('can assert that the element is not focusable', async () => {
    await I.find('Baz').not.focusable();

    await assert.throws(I.find('Bar').not.focusable(),
      '"Bar" is focusable');
    await assert.throws(I.find('Foo').not.focusable(),
      '"Foo" is focusable');
  });
});
