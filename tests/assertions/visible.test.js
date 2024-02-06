import { describe, it, beforeEach } from 'moonshiner';
import { I, assert, fixture } from '../helpers';

describe('Assert | #visible()', () => {
  beforeEach(() => {
    fixture(`
      <style>#testing-root * { width:50px;height:50px;background:#aaaa;overflow:hidden; }</style>
      <div style="display:none">Hidden</div>
      <div style="visibility:hidden" class="invisible">Invisible</div>
      <div style="opacity:0">Opacity 0</div>
      <div style="width:0px;">Width 0</div>
      <div style="height:0px">Height 0</div>
      <div style="position:absolute;top:-999px;">Above Screen</div>
      <div style="position:absolute;bottom:-999px;">Below Screen</div>
      <div style="position:absolute;left:-999px;">Left of Screen</div>
      <div style="position:absolute;right:-999px;">Right of Screen</div>
      <div class="visible" style="position:relative;overflow:visible;margin:50px">
        <style>.visible > * { position: absolute; }</style>
        <div>Fully Covered</div>
        <div style="top:-20%">Peek Top</div>
        <div style="bottom:-20%">Peek Bottom</div>
        <div style="left:-20%">Peek Left</div>
        <div style="right:-20%">Peek Right</div>
        <div>Visible</div>
      </div>
    `);
  });

  const shouldBeVisible = [
    'Peek Top',
    'Peek Bottom',
    'Peek Left',
    'Peek Right',
    'Visible',
    '$(.visible)'
  ];

  const shouldNotBeVisible = [
    'Hidden',
    '$(.invisible)',
    'Opacity 0',
    'Width 0',
    'Height 0',
    'Above Screen',
    'Below Screen',
    'Left of Screen',
    'Right of Screen',
    'Fully Covered'
  ];

  it('asserts that the element is visible', async () => {
    for (let item of shouldBeVisible)
      await I.find(item).visible();

    for (let item of shouldNotBeVisible) {
      await assert.throws(I.find(item).visible(),
        `${item.startsWith('$') ? item : `"${item}"`} is not visible`);
    }
  });

  it('can assert that the element is not visible', async () => {
    for (let item of shouldNotBeVisible)
      await I.find(item).not.visible();

    for (let item of shouldBeVisible) {
      await assert.throws(I.find(item).not.visible(),
        `${item.startsWith('$') ? item : `"${item}"`} is visible`);
    }
  });
});
