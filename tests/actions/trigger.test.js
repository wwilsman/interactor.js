import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture, listen } from '../helpers';

describe('Actions | #trigger(eventName, options?)', () => {
  beforeEach(() => {
    fixture('<div class="foo">Foo</div>');
  });

  it('triggers an arbitrary event on the current element', async () => {
    let event = listen('.foo', 'foobar');

    await I.find('Foo')
      .then.trigger('foobar');

    await assert(event.calls.length === 1,
      'Expected "foobar" event to be triggered');
  });

  it('bubbles and is cancelable by default', async () => {
    let event = listen('.foo', 'xyzzy');

    await I.find('Foo')
      .then.trigger('xyzzy', { foo: 'bar' })
      .then.trigger('xyzzy', { bubbles: null, cancelable: false });

    await assert(event.calls[0][0].foo === 'bar',
      'Expected "xyzzy" event to include event properties');
    await assert(event.calls[0][0].bubbles && event.calls[0][0].cancelable,
      'Expected "xyzzy" event to bubble and be cancelable');
    await assert(!event.calls[1][0].bubbles && !event.calls[1][0].cancelable,
      'Expected "xyzzy" event to not bubble and not be cancelable');
  });
});
