import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Actions | #focus(selector?)', () => {
  beforeEach(() => {
    fixture(`
      <h1 tabindex="0">Foo</h1>
      <button>Bar</button>
      <label>Baz</label>
    `);
  });

  it('focuses the current element', async () => {
    let $foo = document.querySelector('h1');
    let $bar = document.querySelector('button');

    await I.focus('Foo');
    await assert(document.activeElement === $foo,
      'Expected "Foo" to have focus');

    await I.find('Bar').then.focus();
    await assert(document.activeElement === $bar,
      'Expected "Bar" to have focus');
  });

  it('asserts the element is focusable', async () => {
    await assert.throws(I.focus('Baz'),
      '"Baz" is not focusable');
  });
});
