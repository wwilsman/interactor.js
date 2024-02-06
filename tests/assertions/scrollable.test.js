import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #scrollable(axis?)', () => {
  beforeEach(() => {
    fixture(`
      <style>
        .scrollable { width: 100px; height: 100px; }
        .scrollable div { width: 200%; height: 200%; }
        .scrollable.x { overflow-y: hidden; }
        .scrollable.y { overflow-x: hidden; }
        .scrollable.x.y { overflow: auto; }
        .scrollable.hidden { overflow: hidden; }
      </style>
      <div class="scrollable x"><div></div></div>
      <div class="scrollable y"><div></div></div>
      <div class="scrollable x y"><div></div></div>
      <div class="scrollable hidden"><div></div></div>
      <div class="scrollable none"></div>
    `);
  });

  it('asserts that the current element is scrollable', async () => {
    await I.find('$(.scrollable.x)').scrollable();
    await I.find('$(.scrollable.y)').scrollable();
    await I.find('$(.scrollable.x.y)').scrollable();

    await assert.throws(I.find('$(.scrollable.hidden)').scrollable(),
      '$(.scrollable.hidden) is not scrollable');
    await assert.throws(I.find('$(.scrollable.none)').scrollable(),
      '$(.scrollable.none) has no overflow');
  });

  it('asserts that the current element is scrollable on a specific axis', async () => {
    await I.find('$(.scrollable.x)').scrollable('x');
    await I.find('$(.scrollable.y)').scrollable('y');
    await I.find('$(.scrollable.x.y)').scrollable('x');
    await I.find('$(.scrollable.x.y)').scrollable('y');

    await assert.throws(I.find('$(.scrollable.x)').scrollable('y'),
      '$(.scrollable.x) is not scrollable vertically');
    await assert.throws(I.find('$(.scrollable.y)').scrollable('x'),
      '$(.scrollable.y) is not scrollable horizontally');
  });

  it('can assert that the current element is not scrollable', async () => {
    await I.find('$(.scrollable.hidden)').not.scrollable('x');
    await I.find('$(.scrollable.none)').not.scrollable('x');
    await I.find('$(.scrollable.hidden)').not.scrollable('y');
    await I.find('$(.scrollable.none)').not.scrollable('y');
    await I.find('$(.scrollable.hidden)').not.scrollable();
    await I.find('$(.scrollable.none)').not.scrollable();

    await assert.throws(I.find('$(.scrollable.x)').not.scrollable('x'),
      '$(.scrollable.x) is scrollable horizontally');
    await assert.throws(I.find('$(.scrollable.y)').not.scrollable('y'),
      '$(.scrollable.y) is scrollable vertically');
    await assert.throws(I.find('$(.scrollable.x.y)').not.scrollable(),
      '$(.scrollable.x.y) is scrollable');
  });

  it('does not accept an unknown axis', async () => {
    await assert.throws(() => I.find('$(.scrollable)').scrollable('z'),
      'Invalid scroll axis: z');
  });
});
