import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture, listen } from '../helpers';

describe('Actions | #type(string, options?)', () => {
  beforeEach(() => {
    fixture('<input placeholder="Foo" />');
  });

  it('types text into the current or specified element', async () => {
    await I.find('Foo').then.type('Foo');
    await I.type('Bar').into('Foo');

    await assert(document.querySelector('input').value === 'FooBar',
      'Expected input value to be "FooBar"');
  });

  it('focuses and blurs the current element', async () => {
    let focus = listen('input', 'focus');
    let blur = listen('input', 'blur');

    await I.find('Foo')
      .then.type('Bar');

    await assert(focus.calls.length === 1,
      'Expected focus event to be triggered');
    await assert(blur.calls.length === 1,
      'Expected blur event to be triggered');
  });

  it('triggers a change event for inputs', async () => {
    let event = listen('input', 'change');

    await I.find('Foo')
      .then.type('Bar');

    await assert(event.calls.length === 1,
      'Expected change event to be triggered');

    fixture('<div contenteditable></div>');
    event = listen('[contenteditable]', 'change');

    await I.find('$([contenteditable])')
      .then.type('Baz');

    await assert(event.calls.length === 0,
      'Expected change event not to be triggered');
  });

  it('can delay between keystrokes', async () => {
    let start = Date.now();

    await I.find('Foo')
      .then.type('Bar', { delay: 50 });

    let delta = Date.now() - start;

    await assert(delta > 100 && delta < 150,
      'Expected total delay to be between 100-150ms');
  });
});
