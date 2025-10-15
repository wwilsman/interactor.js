import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #overflows(axis?)', () => {
  beforeEach(() => {
    fixture(`
      <style>
        .overflow { width: 100px; height: 100px; overflow: hidden; }
        .overflow div { width: 100%; height: 100%; }
        .overflow.x div { width: 200%; }
        .overflow.y div { height: 200%; }
      </style>
      <div class="overflow x"><div></div></div>
      <div class="overflow y"><div></div></div>
      <div class="overflow x y"><div></div></div>
      <div class="overflow none"><div></div></div>
    `);
  });

  it('asserts that the current element has overflow', async () => {
    await I.find('$(.overflow.x)').overflows();
    await I.find('$(.overflow.y)').overflows();
    await I.find('$(.overflow.x.y)').overflows();

    await assert.throws(I.find('$(.overflow.none)').overflows(),
      '$(.overflow.none) has no overflow');
  });

  it('asserts that the current element has overflow on a specific axis', async () => {
    await I.find('$(.overflow.x)').overflows('x');
    await I.find('$(.overflow.y)').overflows('y');
    await I.find('$(.overflow.x.y)').overflows('x');
    await I.find('$(.overflow.x.y)').overflows('y');

    await assert.throws(I.find('$(.overflow.x)').overflows('y'),
      '$(.overflow.x) has no overflow-y');
    await assert.throws(I.find('$(.overflow.y)').overflows('x'),
      '$(.overflow.y) has no overflow-x');
  });

  it('can assert that the current element does not have overflow', async () => {
    await I.find('$(.overflow.none)').not.overflows('x');
    await I.find('$(.overflow.none)').not.overflows('y');
    await I.find('$(.overflow.none)').not.overflows();

    await assert.throws(I.find('$(.overflow.x)').not.overflows('x'),
      '$(.overflow.x) has overflow-x');
    await assert.throws(I.find('$(.overflow.y)').not.overflows('y'),
      '$(.overflow.y) has overflow-y');
    await assert.throws(I.find('$(.overflow.x.y)').not.overflows(),
      '$(.overflow.x.y) has overflow');
  });

  it('does not accept an unknown axis', async () => {
    // @ts-expect-error - testing invalid axis value
    await assert.throws(() => I.find('$(.overflow)').overflows('z'),
      'Invalid overflow axis: z');
  });
});
