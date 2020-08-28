import { assert, e, fixture } from 'tests/helpers';
import Interactor, { by } from 'interactor.js';

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

  describe('by.xpath(path)', () => {
    it('can select an element by xpath', () => {
      assert.equal(
        Interactor(by.xpath('//ul')).$(),
        document.querySelector('.list')
      );
    });

    it('can select multiple elements by xpath', () => {
      assert.deepEqual(
        Interactor('.list').$$(by.xpath('.//li')),
        Array.from(document.querySelectorAll('.list li'))
      );
    });

    it('formats errors from xpath selectors', () => {
      assert.throws(
        () => Interactor(by.xpath('//foobar')).$(),
        e('InteractorError', 'could not find xpath(//foobar)')
      );
    });

    it('can be used as an interactor selector function', () => {
      let Test = Interactor.extend({ selector: by.xpath }, {});

      assert.equal(
        Test('.//ul').$(),
        document.querySelector('.list')
      );
    });
  });

  describe('by.text(string)', () => {
    it('can select an element by text', () => {
      assert.equal(
        Interactor(by.text('Item', '.list li')).$(),
        document.querySelector('.list li:nth-child(1)')
      );
    });

    it('can select multiple elements by text', () => {
      assert.deepEqual(
        Interactor('.list').$$(by.text('Item', 'li')),
        Array.from(document.querySelectorAll('.list li:not(:last-child)'))
      );
    });

    it('formats errors from text selectors', () => {
      assert.throws(
        () => Interactor(by.text('Item A')).$(),
        e('InteractorError', 'could not find "Item A"')
      );
    });

    it('can be used as an interactor selector function', () => {
      let Test = Interactor.extend({ selector: by.text }, {});

      assert.equal(
        Test('Item 3').$(),
        document.querySelector('.list li:nth-child(3)')
      );
    });
  });

  describe('by.nth(n, selector)', () => {
    it('can select an nth element', () => {
      assert.equal(
        Interactor(by.nth(2, '.list li')).$(),
        document.querySelectorAll('.list li')[1]
      );
    });

    it('can select multiple nth elements', () => {
      assert.deepEqual(
        Interactor('.list').$$(by.nth('odd', 'li')),
        [document.querySelector('.list li:first-child'),
          document.querySelector('.list li:last-child')]
      );
    });

    it('formats errors from nth selectors', () => {
      assert.throws(
        () => Interactor('.list').$(by.nth(15, 'li')),
        e('InteractorError', 'could not find the 15th li within .list')
      );

      assert.throws(
        () => Interactor('.list').$(by.nth(2, 'div')),
        e('InteractorError', 'could not find the 2nd div within .list')
      );

      assert.throws(
        () => Interactor('.list').$(by.nth('n+10', 'li')),
        e('InteractorError', 'could not find the nth(n+10) li within .list')
      );

      assert.throws(
        () => Interactor('.list').$(by.nth(-5, 'li')),
        e('InteractorError', 'could not find the 5th last li within .list')
      );
    });

    it('can be used within an interactor selector function', () => {
      let Test = Interactor.extend({
        selector: n => by.nth(n, '.list li')
      }, {});

      assert.equal(
        Test(1).$(),
        document.querySelector('.list li')
      );
    });
  });
});
