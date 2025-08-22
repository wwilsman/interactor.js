import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Actions | #blur(selector?)', () => {
  beforeEach(() => {
    fixture(`
      <h1 tabindex="0">Foo</h1>
      <button>Bar</button>
    `);
  });

  it('updates the context element', async () => {
    let $foo = document.querySelector('h1');
    $foo.focus();

    let $ = await I.blur('Foo')
      .then.act(({ $ }) => $);

    await assert($.tagName.toLowerCase() === 'h1',
      'Expected the context element to be "Foo"');
  });

  it('blurs the current element', async () => {
    let $foo = document.querySelector('h1');
    let $bar = document.querySelector('button');

    $foo.focus();
    await I.blur('Foo');
    await assert(document.activeElement !== $foo,
      'Expected "Foo" to not be focused');

    $bar.focus();
    await I.find('Bar').then.blur();
    await assert(document.activeElement !== $bar,
      'Expected "Bar" to not be focused');
  });

  it('asserts the element is focused', async () => {
    await assert.throws(I.blur('Foo'),
      '"Foo" is not focused');
  });
});
