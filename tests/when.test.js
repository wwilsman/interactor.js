import { assert } from 'tests/helpers';
import { when } from 'interactor.js';

describe('Utility: when', () => {
  let count;

  beforeEach(() => {
    count = 0;
  });

  it('returns a thennable function', async () => {
    assert.typeOf(when(() => {}), 'function');
    assert.equal(await when(() => 2).then(n => n * 2), 4);
    assert.equal(await when(() => { throw Error('foo'); }).catch(e => e.message), 'foo');
  });

  it('resolves when the provided function does not throw', async () => {
    await when(() => assert(++count > 9));
    assert.equal(count, 10);
  });

  it('rejects when the timeout has been exceeded', async () => {
    await assert.rejects(when(() => assert(++count > 9), 80));
    assert(count < 10);
  });

  it('can be called with an async function', async () => {
    assert.equal(await when(async () => Promise.resolve(10)), 10);
    await assert.rejects(when(async () => Promise.reject(new Error())));
  });

  it('calls the function at an interval', async () => {
    await when(() => assert(++count > 9), { timeout: 80, interval: 3 });
    assert.equal(count, 10);
  });

  it('can continue calling the function after passing for a specified time', async () => {
    await when(() => assert(++count > 9), { remains: 80 });
    assert(count > 10);
  });
});
