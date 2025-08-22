import { describe, it } from 'moonshiner';
import { I, assert } from '../helpers';

describe('Actions | #wait(timeout)', () => {
  it('waits for the specified timeout', async () => {
    let start = Date.now();

    await I.wait(500);

    let elapsed = Date.now() - start;
    await assert(elapsed >= 500 && elapsed < 600,
      `Expected to wait 500-600ms but waited ${elapsed}ms`);
  });

  it('does not wait without a timeout', async () => {
    let start = Date.now();

    await I.wait(0);

    await assert(Date.now() - start < 10,
      'Expected to wait less than 10ms');
  });
});
