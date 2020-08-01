import { assert, e, fixture } from 'tests/helpers';
import Interactor, { by } from 'interactor.js';

describe('Selectors', () => {
  beforeEach(() => {
    fixture(`
      <ul class="list">
        <li>Item</li>
        <li>Item</li>
        <li>Item</li>
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
  });

  describe('by.text(string)', () => {
    it('can select an element by text', () => {
      assert.equal(
        Interactor(by.text('Item')).$(),
        document.querySelector('.list li')
      );
    });

    it('can select multiple elements by text', () => {
      assert.deepEqual(
        Interactor('.list').$$(by.text('Item')),
        Array.from(document.querySelectorAll('.list li'))
      );
    });

    it('formats errors from text selectors', () => {
      assert.throws(
        () => Interactor(by.text('Item A')).$(),
        e('InteractorError', 'could not find "Item A"')
      );
    });
  });
});
