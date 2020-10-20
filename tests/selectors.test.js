import { assert, e, fixture } from 'tests/helpers';
import I from 'interactor.js';

describe('Selectors', () => {
  beforeEach(() => {
    fixture(`
      <ul class="list">
        <li>Item</li>
        <li>Item</li>
        <li>Item 3</li>
      </ul>
    `);
  });

  describe('xpath(path)', () => {
    it('can select an element by xpath', () => {
      assert.equal(
        I(I.find.xpath('//ul')).$(),
        document.querySelector('.list')
      );
    });

    it('can select multiple elements by xpath', () => {
      assert.deepEqual(
        I('.list').$$(I.find.xpath('.//li')),
        Array.from(document.querySelectorAll('.list li'))
      );
    });

    it('formats errors from xpath selectors', () => {
      assert.throws(
        () => I(I.find.xpath('//foobar')).$(),
        e('InteractorError', 'could not find xpath(//foobar)')
      );
    });

    it('can be used as an interactor selector function', () => {
      let Test = I.extend({ selector: I.find.xpath }, {});

      assert.equal(
        Test('.//ul').$(),
        document.querySelector('.list')
      );
    });
  });

  describe('text(string)', () => {
    it('can select an element by text', () => {
      assert.equal(
        I(I.find.text('Item', '.list li')).$(),
        document.querySelector('.list li:nth-child(1)')
      );
    });

    it('can select multiple elements by text', () => {
      assert.deepEqual(
        I('.list').$$(I.find.text('Item', 'li')),
        Array.from(document.querySelectorAll('.list li:not(:last-child)'))
      );
    });

    it('formats errors from text selectors', () => {
      assert.throws(
        () => I(I.find.text('Item A')).$(),
        e('InteractorError', 'could not find "Item A"')
      );
    });

    it('can be used as an interactor selector function', () => {
      let Item = I.extend({ selector: I.find.text }, {});
      let List = I.extend({ item: Item });

      assert.equal(
        Item('Item 3').$(),
        document.querySelector('.list li:nth-child(3)')
      );

      assert.equal(List('.list').item().count(), 3);
    });
  });

  describe('nth(n, selector)', () => {
    it('can select an nth element', () => {
      assert.equal(
        I(I.find.nth(2, '.list li')).$(),
        document.querySelectorAll('.list li')[1]
      );
    });

    it('can select multiple nth elements', () => {
      assert.deepEqual(
        I('.list').$$(I.find.nth('odd', 'li')),
        [document.querySelector('.list li:first-child'),
          document.querySelector('.list li:last-child')]
      );
    });

    it('formats errors from nth selectors', () => {
      assert.throws(
        () => I('.list').$(I.find.nth(15, 'li')),
        e('InteractorError', 'could not find the 15th li within .list')
      );

      assert.throws(
        () => I('.list').$(I.find.nth(2, 'div')),
        e('InteractorError', 'could not find the 2nd div within .list')
      );

      assert.throws(
        () => I('.list').$(I.find.nth('n+10', 'li')),
        e('InteractorError', 'could not find the nth(n+10) li within .list')
      );

      assert.throws(
        () => I('.list').$(I.find.nth(-5, 'li')),
        e('InteractorError', 'could not find the 5th last li within .list')
      );

      assert.throws(
        () => I('.list').$(I.find.nth(-1, 'div')),
        e('InteractorError', 'could not find the last div within .list')
      );

      assert.throws(
        () => I('.list').$(I.find.nth(null, 'div')),
        e('InteractorError', 'could not find div within .list')
      );
    });

    it('can be used within an interactor selector function', () => {
      let Test = I.extend({
        selector: n => I.find.nth(n, '.list li')
      }, {});

      assert.equal(
        Test(1).$(),
        document.querySelector('.list li')
      );

      assert.equal(I().count(Test()), 3);
    });
  });
});
